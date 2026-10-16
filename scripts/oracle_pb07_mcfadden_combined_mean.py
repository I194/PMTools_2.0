#!/usr/bin/env python3
"""PB-07 oracle: combined mean of lines and great circles (McFadden & McElhinny 1988) against pmag.dolnp.

Writes src/__tests__/fixtures/part_b/pb07_mcfadden_combined_mean.pmagpy.json with the locked
mcfadden_combine_mean inputs, three real files, seeded synthetic sets and hand-made edge cases,
each frame (geographic, stratigraphic) with the PmagPy result.

pmag.dolnp returns 0.1-degree strings, so the full-precision oracle replays its own steps:
pmag.process_data_for_mean + pmag.calculate_best_fit_vectors + pmag.cart2dir and the k / a95 algebra
of dolnp (lines with no planes go through pmag.fisher_mean, as dolnp does). The script checks that
this replay prints exactly what dolnp prints on every block.

Adapter: a PMTools row with gcNormal = true is a pole to a plane, dir_type 'p'; any other row is a line.

Run:  python3 scripts/oracle_pb07_mcfadden_combined_mean.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb07_mcfadden_combined_mean.pmagpy.json
"""

from __future__ import annotations

import json
import math

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb07_mcfadden_combined_mean.pmagpy.json"
LOCKED_INPUTS = [
    "src/__tests__/fixtures/computations/mcfadden_combine_mean/directions_only.input.json",
    "src/__tests__/fixtures/computations/mcfadden_combine_mean/directions_and_great_circles.input.json",
]
REAL_DIR_FILES = ["test-data/sample.dir", "test-data/field_batch.dir"]
REAL_CSV_FILES = ["test-data/lab_results.csv"]
FRAMES = {"geographic": ("Dgeo", "Igeo"), "stratigraphic": ("Dstrat", "Istrat")}


def replay_dolnp(pmag, records):
    """dolnp lines 'set up initial points' to 'calculate modified Fisher stats', without the string formatting."""
    fisher_data, n_lines, plane_poles, n_planes, line_sum = pmag.process_data_for_mean(records, "dir_type")
    if n_planes == 0:
        fisher = pmag.fisher_mean(fisher_data)
        return {
            "dec": fisher["dec"],
            "inc": fisher["inc"],
            "R": fisher["r"],
            "k": fisher["k"],
            "a95": fisher["alpha95"],
            "csd": fisher["csd"],
            "nTotal": fisher["n"],
            "nLines": n_lines,
            "nPlanes": 0,
            "a": None,
        }
    if n_lines == 0:
        start = list(pmag.dir2cart([180.0, -45.0, 1.0]))
    else:
        line_sum_length = math.sqrt(sum(component**2 for component in line_sum))
        start = [component / line_sum_length for component in line_sum]
    points_on_circles = pmag.calculate_best_fit_vectors(plane_poles, line_sum, start, n_planes)
    resultant = list(line_sum)
    for point in points_on_circles:
        for component in range(3):
            resultant[component] += point[component]
    R = math.sqrt(sum(component**2 for component in resultant))
    dec, inc, _ = pmag.cart2dir([component / R for component in resultant])
    n_total = n_lines + n_planes
    effective_n = max(n_lines + 0.5 * n_planes, 1.1)
    a = None
    if n_total - R != 0:
        k = (effective_n - 1.0) / (n_total - R)
        a = 1.0 - ((20.0 ** (1.0 / (effective_n - 1.0)) - 1.0) * (effective_n - 1.0) / k) / R
        clipped = 1.0 if abs(a) > 1.0 else a
        a95 = math.degrees(math.acos(-clipped if a < 0 else clipped))
    else:
        k, a95 = math.inf, 0.0
    return {
        "dec": float(dec),
        "inc": float(inc),
        "R": R,
        "k": k,
        "a95": a95,
        "csd": None,
        "nTotal": n_total,
        "nLines": n_lines,
        "nPlanes": n_planes,
        "a": a,
    }


def formatted_like_dolnp(result):
    return {
        "dec": "%7.1f " % result["dec"],
        "inc": "%7.1f " % result["inc"],
        "R": "%5.4f " % result["R"],
        "K": "inf" if result["k"] == math.inf else "%6.0f " % result["k"],
        "alpha95": "%7.1f " % result["a95"],
    }


def oracle(pmag, rows):
    frames = {}
    for frame, (declination_key, inclination_key) in FRAMES.items():
        records = [
            {"dec": row[declination_key], "inc": row[inclination_key], "dir_type": "p" if row["gcNormal"] else "l"}
            for row in rows
        ]
        replay = replay_dolnp(pmag, records)
        dolnp = pmag.dolnp(records, "dir_type")
        printed = {key: dolnp[key] for key in ("dec", "inc", "R", "K", "alpha95")}
        if printed != formatted_like_dolnp(replay):
            raise SystemExit(f"replay disagrees with pmag.dolnp: {printed} vs {formatted_like_dolnp(replay)}")
        frames[frame] = {**replay, "k": None if replay["k"] == math.inf else replay["k"], "dolnp": printed}
    return frames


def to_row(geographic, stratigraphic, great_circle):
    def tenth(value, wrap=False):
        rounded = round(float(value) % 360.0, 1) if wrap else round(float(value), 1)
        return 0.0 if wrap and rounded == 360.0 else rounded

    return {
        "Dgeo": tenth(geographic[0], True),
        "Igeo": tenth(geographic[1]),
        "Dstrat": tenth(stratigraphic[0], True),
        "Istrat": tenth(stratigraphic[1]),
        "gcNormal": great_circle,
    }


def fisher_deviate(pmag, rng, mean_declination, mean_inclination, kappa):
    uniform = rng.uniform()
    cos_theta = 1.0 + math.log(1.0 - uniform * (1.0 - math.exp(-2.0 * kappa))) / kappa
    local_inclination = 90.0 - math.degrees(math.acos(cos_theta))
    local_declination = rng.uniform(0.0, 360.0)
    return pmag.dodirot(local_declination, local_inclination, mean_declination, mean_inclination)


def pole_of_circle_through(pmag, rng, direction):
    """A random plane that contains `direction`: its pole is a random vector made perpendicular to it."""
    through = np.array(pmag.dir2cart([direction[0], direction[1], 1.0]))
    random_vector = rng.normal(size=3)
    pole = random_vector - random_vector.dot(through) * through
    declination, inclination, _ = pmag.cart2dir(pole / np.linalg.norm(pole))
    return float(declination), float(inclination)


def synthetic_cases(pmag):
    rng = np.random.default_rng(SEED)
    plan = (
        [("lines only", lines, 0) for lines in (2, 3, 7, 20)]
        + [("1 line + 1 circle", 1, 1)] * 4
        + [("1 line + 4 circles", 1, 4)] * 4
        + [("5 lines + 3 circles", 5, 3)] * 2
    )
    cases = []
    for index, (label, line_count, circle_count) in enumerate(plan):
        mean_declination = float(rng.uniform(0.0, 360.0))
        mean_inclination = float(rng.uniform(-80.0, 80.0))
        kappa = float(rng.choice([15.0, 50.0, 200.0]))
        bedding_dip_direction = float(rng.uniform(0.0, 360.0))
        bedding_dip = float(rng.uniform(0.0, 60.0))
        rows = []
        for row_index in range(line_count + circle_count):
            direction = fisher_deviate(pmag, rng, mean_declination, mean_inclination, kappa)
            great_circle = row_index >= line_count
            if great_circle:
                direction = pole_of_circle_through(pmag, rng, direction)
            stratigraphic = pmag.dotilt(direction[0], direction[1], bedding_dip_direction, bedding_dip)
            rows.append(to_row(direction, stratigraphic, great_circle))
        cases.append(
            {
                "name": f"seeded {index}: {label}, mean {mean_declination:.1f}/{mean_inclination:.1f}, kappa {kappa:g}",
                "group": label,
                "rows": rows,
            }
        )
    return cases


def same_in_both_frames(name, group, rows):
    return {
        "name": name,
        "group": group,
        "rows": [to_row(row[:2], row[:2], row[2]) for row in rows],
    }


def edge_cases():
    return [
        same_in_both_frames("two lines", "edge", [(340, 35, False), (350, 30, False)]),
        same_in_both_frames("lines across declination 0", "edge", [(359, 40, False), (1, 40, False), (358, 42, False)]),
        same_in_both_frames(
            "lines around declination 0 + horizontal circle (optimum lies on the grid)",
            "edge",
            [(10, 5, False), (350, -5, False), (0, 90, True)],
        ),
        same_in_both_frames(
            "declination wrap: lines across 0 + circle", "edge", [(359, 40, False), (1, 40, False), (358, 42, False), (90, 0, True)]
        ),
        same_in_both_frames("near-vertical lines + circle", "edge", [(0, 90, False), (10, 89, False), (90, 0, True)]),
        same_in_both_frames(
            "circle-dominated, wide dihedral angles",
            "edge",
            [(20, 50, False), (300, 10, True), (120, -20, True), (200, 30, True), (60, -40, True)],
        ),
        same_in_both_frames(
            "scattered, a < 0", "edge", [(207.8, -16.5, False), (351.5, -72.5, False), (309.0, -33.7, True)]
        ),
        same_in_both_frames("circles only, nearly coincident", "circles only", [(70, 10, True), (250, -5, True)]),
        same_in_both_frames("circles only, orthogonal poles", "circles only", [(0, 0, True), (90, 0, True)]),
    ]


def locked_cases():
    cases = []
    for relative_path in LOCKED_INPUTS:
        rows = [
            {key: row[key] for key in ("Dgeo", "Igeo", "Dstrat", "Istrat", "gcNormal")}
            for row in json.loads((REPO_ROOT / relative_path).read_text())
        ]
        cases.append({"name": relative_path.split("/")[-1], "group": "locked", "rows": rows})
        if any(row["gcNormal"] for row in rows):
            reordered = [row for row in rows if not row["gcNormal"]] + [row for row in rows if row["gcNormal"]][::-1]
            cases.append({"name": "directions_and_great_circles with the circles swapped", "group": "locked", "rows": reordered})
    return cases


def real_file_cases():
    cases = []
    for relative_path in REAL_DIR_FILES:
        rows = []
        for line in (REPO_ROOT / relative_path).read_text().splitlines():
            if len(line) <= 1:
                continue
            columns = [float(line[start:end]) for start, end in [(27, 33), (33, 39), (39, 45), (45, 51)]]
            rows.append(to_row(columns[:2], columns[2:], line[7:14].strip().startswith("GC")))
        cases.append({"name": relative_path, "group": "real file", "path": relative_path, "rows": rows})
    for relative_path in REAL_CSV_FILES:
        rows = []
        for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:]:
            if len(line) <= 1:
                continue
            fields = line.split(",")
            rows.append(
                to_row((float(fields[4]), float(fields[5])), (float(fields[8]), float(fields[9])), fields[1].startswith("GC"))
            )
        cases.append({"name": relative_path, "group": "real file", "path": relative_path, "rows": rows})
    return cases


def main() -> None:
    pmag = require_pmagpy()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    cases = locked_cases() + real_file_cases() + synthetic_cases(pmag) + edge_cases()
    for case in cases:
        case["pmagpy"] = oracle(pmag, case["rows"])
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": (
            "pmag.dolnp(records, 'dir_type') replayed at full precision (process_data_for_mean, "
            "calculate_best_fit_vectors, cart2dir, dolnp k/a95); no planes -> pmag.fisher_mean; "
            "k null means 'inf'; dolnp holds dolnp's own printed strings"
        ),
        "seed": SEED,
        "cases": cases,
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2, allow_nan=False) + "\n")
    print(f"[pb07] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)} ({len(cases)} cases)")


if __name__ == "__main__":
    main()
