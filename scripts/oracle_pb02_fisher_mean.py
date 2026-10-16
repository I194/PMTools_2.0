#!/usr/bin/env python3
"""PB-02 oracle: Fisher mean, k, a95, R, N and csd against pmag.fisher_mean.

Writes src/__tests__/fixtures/part_b/pb02_fisher_mean.pmagpy.json with
  - liveDirPath: real .dir / .pmm files (and one multi-decimal synthetic table) run through the
    live DIR-page preprocessing of calculateStatisticsDIR: rows picked by 1-based index, user-marked
    rows flipped (dec + 180) % 360 and -inc, every value rounded like JS toFixed(1), then one
    pmag.fisher_mean per frame;
  - synthetic: seeded Fisher-distributed sets and edge cases fed unrounded to calculateFisherMean.

PmagPy returns k as the string 'inf' when R == N and only dec/inc when N < 2; both are kept as
PmagPy returns them so the test shows the adapter.

Run:  python3 scripts/oracle_pb02_fisher_mean.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb02_fisher_mean.pmagpy.json
"""

from __future__ import annotations

import json
import math
from decimal import ROUND_HALF_UP, Decimal

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb02_fisher_mean.pmagpy.json"


def to_fixed_one(value):
    # JS toFixed(1) rounds the exact binary value half away from zero; Python round() and
    # Decimal(str(value)) both disagree with it on some ties (e.g. 10.25, 1.15).
    return float(Decimal(value).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def fisher_result(pmag, directions):
    result = pmag.fisher_mean([list(direction) for direction in directions])
    converted = {key: (value if isinstance(value, str) else float(value)) for key, value in result.items()}
    if "n" in converted:
        converted["n"] = int(converted["n"])
    return converted


def parse_dir_rows(relative_path):
    """Same fixed-width columns as parserDIR.ts (sample.dir has no 'rep G' rows)."""
    rows = []
    for line in (REPO_ROOT / relative_path).read_text().splitlines():
        if len(line) <= 1:
            continue
        assert line[7:14].strip() != "rep G", "paired 'rep G' rows are not emulated"
        rows.append([float(line[start:end]) for start, end in [(27, 33), (33, 39), (39, 45), (45, 51)]])
    return rows


def parse_pmm_rows(relative_path):
    """Same split as parserPMM.ts: drop the first line and the column header, strip all whitespace."""
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:] if len(line) > 1]
    rows = []
    for line in lines[2:]:
        fields = "".join(line.split()).split(",")
        rows.append([float(fields[4]), float(fields[5]), float(fields[8]), float(fields[9])])
    return rows


def preprocess_live_dir(rows, selected_ids, reversed_ids):
    """calculateStatisticsDIR.ts: select by 1-based index, flip by id, round to 0.1."""
    geographic, stratigraphic = [], []
    for index, (dgeo, igeo, dstrat, istrat) in enumerate(rows):
        row_id = index + 1
        if row_id not in selected_ids:
            continue
        if row_id in reversed_ids:
            # math.fmod keeps the sign of the dividend like JS %, unlike Python %.
            dgeo, igeo = math.fmod(dgeo + 180, 360), -igeo
            dstrat, istrat = math.fmod(dstrat + 180, 360), -istrat
        geographic.append([to_fixed_one(dgeo), to_fixed_one(igeo)])
        stratigraphic.append([to_fixed_one(dstrat), to_fixed_one(istrat)])
    return geographic, stratigraphic


def live_scenario(pmag, rows, name, selected_ids, reversed_ids):
    geographic, stratigraphic = preprocess_live_dir(rows, selected_ids, reversed_ids)
    return {
        "name": name,
        "selectedDirectionsIDs": selected_ids,
        "reversedDirectionsIDs": reversed_ids,
        "pmagpy": {
            "geographic": fisher_result(pmag, geographic),
            "stratigraphic": fisher_result(pmag, stratigraphic),
        },
    }


def live_dir_path_sources(pmag):
    sample_rows = parse_dir_rows("test-data/sample.dir")
    sample_ids = list(range(1, len(sample_rows) + 1))
    sample = {
        "source": "test-data/sample.dir",
        "parser": "dir",
        "rows": sample_rows,
        "scenarios": [
            live_scenario(pmag, sample_rows, "all rows, reversed rows 2/4/6/8 flipped", sample_ids, [2, 4, 6, 8]),
            live_scenario(pmag, sample_rows, "all rows, no flips (bimodal, a < 0)", sample_ids, []),
            live_scenario(pmag, sample_rows, "normal rows 1/3/5/7 only", [1, 3, 5, 7], []),
            live_scenario(pmag, sample_rows, "rows 2 and 4 only (N = 2)", [2, 4], []),
        ],
    }

    example_rows = parse_pmm_rows("src/assets/examples/exampleDIR.pmm")
    example_ids = list(range(1, len(example_rows) + 1))
    southward_ids = [row_id for row_id, row in zip(example_ids, example_rows) if 90 < row[0] < 270]
    example = {
        "source": "src/assets/examples/exampleDIR.pmm",
        "parser": "pmm",
        "rows": example_rows,
        "scenarios": [
            live_scenario(pmag, example_rows, "all rows, no flips", example_ids, []),
            live_scenario(pmag, example_rows, "all rows, southward rows flipped", example_ids, southward_ids),
            live_scenario(pmag, example_rows, "all rows flipped", example_ids, example_ids),
            live_scenario(pmag, example_rows, "first 10 rows", example_ids[:10], []),
        ],
    }

    # Multi-decimal values (as CSV/XLSX imports can carry) exercise the toFixed(1) emulation,
    # including exact binary ties 10.25, -0.25, 0.75 and a flip that crosses 360.
    rounding_rows = [
        [10.04, 45.06, 10.25, -0.25],
        [12.05, 47.04, 12.75, 0.75],
        [8.06, 43.05, 1.15, 2.675],
        [359.96, 44.04, 359.95, 45.05],
        [190.13, -46.17, 185.333, -40.25],
    ]
    rounding = {
        "source": "synthetic multi-decimal table",
        "parser": None,
        "rows": rounding_rows,
        "scenarios": [
            live_scenario(pmag, rounding_rows, "all rows, no flips", [1, 2, 3, 4, 5], []),
            live_scenario(pmag, rounding_rows, "all rows, row 5 flipped", [1, 2, 3, 4, 5], [5]),
        ],
    }
    return [sample, example, rounding]


def fisher_distributed_directions(rng, count, kappa, mean_declination, mean_inclination):
    """Draw unit vectors from a Fisher distribution about (mean_declination, mean_inclination)."""
    uniform = rng.uniform(size=count)
    cos_theta = 1 + np.log(uniform + (1 - uniform) * np.exp(-2 * kappa)) / kappa
    sin_theta = np.sqrt(np.clip(1 - cos_theta**2, 0, None))
    phi = rng.uniform(0, 2 * np.pi, size=count)
    local = np.stack([sin_theta * np.cos(phi), sin_theta * np.sin(phi), cos_theta], axis=1)
    # Rotate the local north pole onto the requested mean direction.
    colatitude = np.radians(90 - mean_inclination)
    longitude = np.radians(mean_declination)
    rotate_y = np.array(
        [[np.cos(colatitude), 0, np.sin(colatitude)], [0, 1, 0], [-np.sin(colatitude), 0, np.cos(colatitude)]]
    )
    rotate_z = np.array(
        [[np.cos(longitude), -np.sin(longitude), 0], [np.sin(longitude), np.cos(longitude), 0], [0, 0, 1]]
    )
    vectors = local @ (rotate_z @ rotate_y).T
    declinations = np.degrees(np.arctan2(vectors[:, 1], vectors[:, 0])) % 360
    inclinations = np.degrees(np.arcsin(np.clip(vectors[:, 2], -1, 1)))
    return [[float(declination), float(inclination)] for declination, inclination in zip(declinations, inclinations)]


def synthetic_cases(pmag):
    rng = np.random.default_rng(SEED)
    cases = []
    for count in [2, 3, 5, 8, 15, 30]:
        for kappa in [3, 30, 300]:
            frames = [
                fisher_distributed_directions(
                    rng, count, kappa, float(rng.uniform(0, 360)), float(rng.uniform(-90, 90))
                )
                for _ in range(2)
            ]
            cases.append({"name": f"fisher N={count} kappa={kappa}", "compare": "all", "frames": frames})

    def same_frames(name, directions, compare="all"):
        cases.append({"name": name, "compare": compare, "frames": [directions, directions]})

    same_frames("N = 1 (PmagPy returns dec/inc only)", [[25.0, 60.0]], "directionOnly")
    same_frames("N = 2 distinct", [[10.0, 45.0], [20.0, 50.0]])
    same_frames("three identical directions (R == N, k 'inf')", [[10.0, 45.0]] * 3)
    same_frames("antipodal pair (R ~ 0, mean direction is noise)", [[10.0, 45.0], [190.0, -45.0]], "statisticsOnly")
    same_frames("four directions with -1 < a < 0 (a95 = 180)", [[0.0, 0.0], [120.0, 0.0], [240.0, 0.0], [0.0, 10.0]])
    same_frames("all exactly vertical (R == N)", [[0.0, 90.0], [90.0, 90.0], [180.0, 90.0]])
    same_frames("near-vertical", [[0.0, 89.9], [120.0, 89.8], [240.0, 89.7]])
    same_frames("declination wrap at 0/360", [[359.9, 45.0], [0.1, 45.0], [0.3, 46.0], [359.5, 44.0]])
    same_frames("declination wrap, upward", [[358.0, -30.0], [2.5, -31.0], [1.0, -29.5]])
    same_frames(
        "pmag.fisher_mean docstring example", [[150.0, -45.0], [151.0, -46.0], [145.0, -38.0], [146.0, -41.0]]
    )

    for case in cases:
        geographic, stratigraphic = case.pop("frames")
        case["geographic"] = geographic
        case["stratigraphic"] = stratigraphic
        case["pmagpy"] = {
            "geographic": fisher_result(pmag, geographic),
            "stratigraphic": fisher_result(pmag, stratigraphic),
        }
    return cases


def main() -> None:
    pmag = require_pmagpy()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": "pmag.fisher_mean([[dec, inc], ...]) once per frame; k is the string 'inf' when R == N",
        "seed": SEED,
        "liveDirPath": live_dir_path_sources(pmag),
        "synthetic": synthetic_cases(pmag),
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2) + "\n")
    print(f"[pb02] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
