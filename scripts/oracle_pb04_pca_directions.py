#!/usr/bin/env python3
"""PB-04 oracle: DIR-page great-circle fit (calculatePCA_dir) against pmag.doprinc / pmag.domean.

Writes src/__tests__/fixtures/part_b/pb04_pca_directions.pmagpy.json with seeded synthetic
girdles, edge cases, real DIR files (as the DIR page selects them) and degenerate selections,
each with the PmagPy result per frame.

Oracles (PB-00): pole = pmag.doprinc V3dec/V3inc antipoded to the upper hemisphere (PMTools
reports inc <= 0, doprinc flips every axis down); MAD = pmag.domean(rows, 0, N-1, 'DE-BFP')
['specimen_mad'], the same atan(sqrt(t3/t2 + t3/t1)) on the same uncentred orientation matrix.

Dispatcher adapter: calculateStatisticsDIR antipodes the rows flagged as reversed, then rounds
every angle to 0.1 deg (toFixed(1)) before the fit, so the oracle is fed those values.

Run:  python3 scripts/oracle_pb04_pca_directions.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb04_pca_directions.pmagpy.json
"""

from __future__ import annotations

import copy
import json
from decimal import ROUND_HALF_UP, Decimal

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb04_pca_directions.pmagpy.json"
# Below this oracle tau3 the inputs are coplanar and tau3 (hence MAD) is float noise on both sides.
COPLANAR_TAU3 = 1e-12
HORIZONTAL_POLE_INCLINATION = 1e-6


def to_fixed_one(value: float) -> float:
    """JavaScript toFixed(1): exact decimal expansion of the double, ties away from zero."""
    return float(Decimal(value).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))


def reverse_polarity(declination: float, inclination: float) -> tuple[float, float]:
    """Direction.reversePolarity (Direction.ts:62-68)."""
    return (declination + 180) % 360, -inclination


def plane_mad(pmag, directions: list[list[float]]) -> float:
    """domean rows are [step, dec, inc, intensity, ZI, flag]; it mutates them, hence the copy."""
    rows = [[index, declination, inclination, 1.0, "", "g"] for index, (declination, inclination) in enumerate(directions)]
    return float(pmag.domean(copy.deepcopy(rows), 0, len(directions) - 1, "DE-BFP")["specimen_mad"])


def oracle_frame(pmag, directions: list[list[float]]) -> dict:
    principal = pmag.doprinc([list(direction) for direction in directions])
    pole_declination, pole_inclination = float(principal["V3dec"]), float(principal["V3inc"])
    if pole_inclination > 0:
        pole_declination, pole_inclination = (pole_declination + 180) % 360, -pole_inclination
    tau = [float(np.real(principal[key])) for key in ("tau1", "tau2", "tau3")]
    return {
        "doprincV3": [float(principal["V3dec"]), float(principal["V3inc"])],
        "pole": [pole_declination, pole_inclination],
        "tau": tau,
        "mad": plane_mad(pmag, directions),
        "coplanar": tau[2] < COPLANAR_TAU3,
        "horizontalPole": abs(pole_inclination) < HORIZONTAL_POLE_INCLINATION,
    }


def frames_case(pmag, name: str, geographic: list[list[float]], stratigraphic: list[list[float]]) -> dict:
    return {
        "name": name,
        "geographic": geographic,
        "stratigraphic": stratigraphic,
        "pmagpy": {
            "geographic": oracle_frame(pmag, geographic),
            "stratigraphic": oracle_frame(pmag, stratigraphic),
        },
    }


def random_girdle(rng, count: int, arc_degrees: float, scatter_degrees: float) -> list[list[float]]:
    pole = rng.normal(size=3)
    pole /= np.linalg.norm(pole)
    first_axis = np.cross(pole, rng.normal(size=3))
    first_axis /= np.linalg.norm(first_axis)
    second_axis = np.cross(pole, first_axis)
    start = rng.uniform(0, 360)
    directions = []
    for _ in range(count):
        along = np.radians(start + rng.uniform(0, arc_degrees))
        off_plane = np.radians(rng.normal(0, scatter_degrees))
        in_plane = np.cos(along) * first_axis + np.sin(along) * second_axis
        vector = np.cos(off_plane) * in_plane + np.sin(off_plane) * pole
        declination = float(np.degrees(np.arctan2(vector[1], vector[0])) % 360)
        inclination = float(np.degrees(np.arcsin(np.clip(vector[2], -1, 1))))
        directions.append([declination, inclination])
    return directions


def synthetic_cases(pmag, rng) -> list[dict]:
    cases = []
    arcs_and_scatters = ((360, 2), (180, 8), (90, 4), (360, 20))
    settings = [(count, arc, scatter) for count in (3, 5, 8, 12, 20) for arc, scatter in arcs_and_scatters]
    for index, (count, arc, scatter) in enumerate(settings):
        geographic = random_girdle(rng, count, arc, scatter)
        stratigraphic = random_girdle(rng, count, arc, scatter)
        name = f"girdle {index}: N={count} arc={arc} scatter={scatter}"
        cases.append(frames_case(pmag, name, geographic, stratigraphic))
    return cases


def edge_cases(pmag) -> list[dict]:
    edges = {
        "N=2 opposite polarities": [[338.2, 36.9], [145.5, -42.3]],
        "N=2 close pair": [[10, 30], [40, 35]],
        "declination wrap at 0/360": [[359.5, 40], [0.5, 42], [1.2, 38], [358.8, 41]],
        "vertical pole (all directions horizontal)": [[0, 0], [45, 0], [90, 0], [200, 0]],
        "nearly vertical pole": [[0, 0.3], [45, -0.2], [90, 0.1], [200, -0.4]],
        "horizontal pole (directions in one vertical plane)": [[45, 10], [45, 40], [45, 70], [225, -20]],
        "nearly horizontal pole": [[45.2, 10], [44.9, 40], [45.1, 70], [224.8, -20]],
        "vertical and horizontal directions": [[0, 90], [0, -90], [90, 0]],
        "five scattered great-circle poles": [[120, 10], [200, 20], [300, 5], [20, -15], [250, 30]],
        "four steep upward directions": [[120, -70], [200, -60], [300, -75], [20, -65]],
    }
    return [frames_case(pmag, name, directions, directions) for name, directions in edges.items()]


def read_dir_rows(relative_path: str) -> list[dict]:
    """Fixed columns of a plain .dir row (parserDIR.ts: label 0-7, Dgeo 27-33 ... Istrat 45-51)."""
    rows = []
    for line in (REPO_ROOT / relative_path).read_text().splitlines():
        if len(line) <= 1:
            continue
        values = [float(line[start:end]) for start, end in ((27, 33), (33, 39), (39, 45), (45, 51))]
        rows.append({"label": line[0:7].strip(), "values": values})
    return rows


def read_pmm_rows(relative_path: str) -> list[dict]:
    """parserPMM.ts: drop the first line, then two header lines; columns 4, 5, 8, 9 are Dg Ig Ds Is."""
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:] if len(line) > 1]
    rows = []
    for line in lines[2:]:
        params = "".join(line.split()).split(",")
        rows.append({"label": params[0], "values": [float(params[column]) for column in (4, 5, 8, 9)]})
    return rows


def dispatcher_case(
    pmag, name: str, path: str | None, rows: list[dict], selected_ids: list[int], reversed_ids: list[int]
) -> dict:
    """calculateStatisticsDIR: ids are 1-based positions; reversed rows antipoded, then toFixed(1)."""
    geographic, stratigraphic = [], []
    for position in selected_ids:
        geo_declination, geo_inclination, strat_declination, strat_inclination = rows[position - 1]["values"]
        if position in reversed_ids:
            geo_declination, geo_inclination = reverse_polarity(geo_declination, geo_inclination)
            strat_declination, strat_inclination = reverse_polarity(strat_declination, strat_inclination)
        geographic.append([to_fixed_one(geo_declination), to_fixed_one(geo_inclination)])
        stratigraphic.append([to_fixed_one(strat_declination), to_fixed_one(strat_inclination)])
    case = frames_case(pmag, name, geographic, stratigraphic)
    case.update({"path": path, "selectedIds": selected_ids, "reversedIds": reversed_ids})
    if path is None:
        case["rows"] = [row["values"] for row in rows]
    return case


def real_file_cases(pmag) -> list[dict]:
    cases = []
    sample_path = "test-data/sample.dir"
    sample = read_dir_rows(sample_path)
    all_sample = list(range(1, len(sample) + 1))
    for name, selected, reversed_ids in [
        ("sample.dir, all rows", all_sample, []),
        ("sample.dir, all rows, rows 2/4/6/8 reversed", all_sample, [2, 4, 6, 8]),
        ("sample.dir, rows 1-4", [1, 2, 3, 4], []),
    ]:
        cases.append(dispatcher_case(pmag, name, sample_path, sample, selected, reversed_ids))

    field_batch_path = "test-data/field_batch.dir"
    field_batch = read_dir_rows(field_batch_path)
    all_field_batch = list(range(1, len(field_batch) + 1))
    for name, reversed_ids in [("field_batch.dir, all rows", []), ("field_batch.dir, all rows, rows 4/5 reversed", [4, 5])]:
        cases.append(dispatcher_case(pmag, name, field_batch_path, field_batch, all_field_batch, reversed_ids))

    example_path = "src/assets/examples/exampleDIR.pmm"
    example = read_pmm_rows(example_path)
    all_example = list(range(1, len(example) + 1))
    upward_example = [position for position in all_example if example[position - 1]["values"][1] < 0]
    name = "exampleDIR.pmm, all rows, upward rows reversed"
    cases.append(dispatcher_case(pmag, name, example_path, example, all_example, upward_example))
    for start in range(1, len(example) + 1, 25):
        window = list(range(start, min(start + 12, len(example) + 1)))
        if len(window) >= 2:
            name = f"exampleDIR.pmm, rows {window[0]}-{window[-1]}"
            cases.append(dispatcher_case(pmag, name, example_path, example, window, []))
    return cases


def rounded_synthetic_cases(pmag, rng) -> list[dict]:
    """Unrounded rows through the dispatcher: exercises its reversal + toFixed(1) preprocessing."""
    cases = []
    for index in range(8):
        count = int(rng.integers(3, 12))
        geographic = random_girdle(rng, count, 270, 6)
        stratigraphic = random_girdle(rng, count, 270, 6)
        rows = [
            {"label": str(position + 1), "values": [*geographic[position], *stratigraphic[position]]}
            for position in range(count)
        ]
        selected = list(range(1, count + 1))
        reversed_ids = [position for position in selected if rng.uniform() < 0.4]
        name = f"unrounded girdle {index} via the dispatcher"
        cases.append(dispatcher_case(pmag, name, None, rows, selected, reversed_ids))
    return cases


def degenerate_cases(pmag) -> list[dict]:
    """Rank-1 orientation matrices: every great circle through the repeated point fits exactly."""
    cases = []
    for name, rows in {
        "three identical rows (10, 30)": [[10, 30, 10, 30]] * 3,
        "two identical rows (338.2, 36.9), sample.dir row 1 twice": [[338.2, 36.9, 350.0, 25.3]] * 2,
    }.items():
        geographic = [[to_fixed_one(values[0]), to_fixed_one(values[1])] for values in rows]
        cases.append(
            {
                "name": name,
                "rows": rows,
                "selectedIds": list(range(1, len(rows) + 1)),
                "geographic": geographic,
                "pmagpyMad": plane_mad(pmag, geographic),
            }
        )
    return cases


def main() -> None:
    pmag = require_pmagpy()
    rng = np.random.default_rng(SEED)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": (
            "pole: pmag.doprinc V3dec/V3inc antipoded to inc <= 0; "
            "MAD: pmag.domean(rows, 0, N-1, 'DE-BFP')['specimen_mad']"
        ),
        "seed": SEED,
        "synthetic": synthetic_cases(pmag, rng),
        "edges": edge_cases(pmag),
        "dispatcher": real_file_cases(pmag) + rounded_synthetic_cases(pmag, rng),
        "degenerate": degenerate_cases(pmag),
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2) + "\n")
    print(f"[pb04] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
