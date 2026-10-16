#!/usr/bin/env python3
"""PB-08 oracle: the fixed 45 degree cutoff of the DIR page against pmag.fisher_mean + pmag.angle.

Writes src/__tests__/fixtures/part_b/pb08_cutoff.pmagpy.json. Every dataset holds its directions,
the PmagPy Fisher mean of those directions, pmag.angle from that mean to each direction and the
rejected indices (angle > 45), which is what PMTools' markCutoffComments / DIRPage Graphs.tsx do.

For reference only, each dataset with N >= 3 also records what pmag.dovandamme (Vandamme 1994,
iterative variable cutoff) would reject. dovandamme works on VGP colatitudes; here it is fed the
angle to the Fisher mean as the colatitude (directions rotated so the mean is the pole).

Run:  python3 scripts/oracle_pb08_cutoff.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb08_cutoff.pmagpy.json
"""

from __future__ import annotations

import json
import math

import numpy as np
import pandas as pd

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
CUTOFF_ANGLE = 45.0
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb08_cutoff.pmagpy.json"
BOUNDARY_OFFSET = 1e-9


def finite_or_none(value):
    value = float(value)
    return value if math.isfinite(value) else None


def read_dir_file(relative_path):
    """Fixed-width .dir rows, same column slices as parserDIR.ts (no 'rep G' pairs in this file)."""
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines() if len(line) > 1]
    return {
        "geographic": [[float(line[27:33]), float(line[33:39])] for line in lines],
        "stratigraphic": [[float(line[39:45]), float(line[45:51])] for line in lines],
    }


def read_pmm_file(relative_path):
    """Comma-separated .pmm rows after the two header lines, same columns as parserPMM.ts."""
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:] if len(line) > 1]
    rows = ["".join(line.split()).split(",") for line in lines[2:]]
    return {
        "geographic": [[float(row[4]), float(row[5])] for row in rows],
        "stratigraphic": [[float(row[8]), float(row[9])] for row in rows],
    }


def fisher_deviates(rng, count, kappa, mean_declination, mean_inclination, pmag):
    """Fisher-distributed directions about (mean_declination, mean_inclination), seeded."""
    uniform_a = rng.uniform(size=count)
    uniform_b = rng.uniform(size=count)
    lower_limit = math.exp(-2 * kappa)
    colatitude_factor = np.sqrt(-np.log(uniform_a * (1 - lower_limit) + lower_limit) / (2 * kappa))
    inclinations = 90 - 2 * np.degrees(np.arcsin(colatitude_factor))
    declinations = 360 * uniform_b
    about_pole = np.column_stack([declinations, inclinations])
    rotated = pmag.dodirot_V(about_pole, mean_declination, mean_inclination)
    return [[float(row[0]) % 360, float(row[1])] for row in rotated]


def uniform_sphere_directions(rng, count, pmag):
    vectors = rng.normal(size=(count, 3))
    return [[float(row[0]), float(row[1])] for row in pmag.cart2dir(vectors)]


def vandamme_reference(angles):
    if len(angles) < 3:
        return None
    colatitude_frame = pd.DataFrame({"vgp_lat": 90 - np.asarray(angles)})
    result = require_pmagpy().dovandamme(colatitude_frame)
    if result is None:  # dovandamme falls through its while loop and returns None
        return None
    kept_frame, cutoff, angular_standard_deviation = result
    kept = set(kept_frame.index.tolist())
    return {
        "cutoff": float(cutoff),
        "angularStandardDeviation": float(angular_standard_deviation),
        "rejectedIndices": [index for index in range(len(angles)) if index not in kept],
    }


def oracle(pmag, directions):
    fisher = pmag.fisher_mean(directions)
    mean = [float(fisher["dec"]), float(fisher["inc"])]
    angles = [finite_or_none(pmag.angle(direction, mean)[0]) for direction in directions]
    finite_angles = [angle for angle in angles if angle is not None]
    return {
        "mean": mean,
        "angles": angles,
        "rejectedIndices": [index for index, angle in enumerate(angles) if angle is not None and angle > CUTOFF_ANGLE],
        "smallestDistanceToCutoff": min(abs(angle - CUTOFF_ANGLE) for angle in finite_angles),
        "vandamme": vandamme_reference(finite_angles) if len(finite_angles) == len(angles) else None,
    }


def real_file_datasets(pmag):
    datasets = []
    for relative_path, reader in [
        ("test-data/sample.dir", read_dir_file),
        ("src/assets/examples/exampleDIR.pmm", read_pmm_file),
    ]:
        by_reference = reader(relative_path)
        for reference in ["geographic", "stratigraphic"]:
            directions = by_reference[reference]
            datasets.append(
                {
                    "name": f"{relative_path} ({reference})",
                    "path": relative_path,
                    "reference": reference,
                    "directions": directions,
                    "pmagpy": oracle(pmag, directions),
                }
            )
    return datasets


def synthetic_datasets(pmag):
    rng = np.random.default_rng(SEED)
    definitions = [
        ("k=15 N=40 about (35, 52) plus 5 uniform outliers", 15, 40, 35, 52, 5),
        ("k=5 N=30 about (210, -40), dispersed", 5, 30, 210, -40, 0),
        ("k=40 N=25 about (359.5, 20) plus 3 outliers, declination wrap", 40, 25, 359.5, 20, 3),
        ("k=25 N=20 about (100, 86), near the pole, plus 2 outliers", 25, 20, 100, 86, 2),
        ("k=10 N=60 about (180, 0), horizontal mean, plus 6 outliers", 10, 60, 180, 0, 6),
    ]
    datasets = []
    for name, kappa, count, mean_declination, mean_inclination, outlier_count in definitions:
        directions = fisher_deviates(rng, count, kappa, mean_declination, mean_inclination, pmag)
        directions += uniform_sphere_directions(rng, outlier_count, pmag)
        datasets.append({"name": f"synthetic {name}", "directions": directions})

    normal = fisher_deviates(rng, 20, 20, 15, 45, pmag)
    reversed_polarity = fisher_deviates(rng, 10, 20, 195, -45, pmag)
    datasets.append(
        {"name": "synthetic bimodal 20 normal + 10 reversed, not flipped", "directions": normal + reversed_polarity}
    )

    for dataset in datasets:
        dataset["pmagpy"] = oracle(pmag, dataset["directions"])
        assert dataset["pmagpy"]["smallestDistanceToCutoff"] > 1e-6, dataset["name"]
    return datasets


def edge_datasets(pmag):
    edges = [
        ("N=1", [[123.4, -37.2]]),
        ("N=2, 100 degrees apart (both 50 from the mean)", [[0.0, 0.0], [100.0, 0.0]]),
        ("N=2, 89 degrees apart (both 44.5 from the mean)", [[0.0, 0.0], [89.0, 0.0]]),
        (
            "45 - 1e-9 from the mean along a meridian (kept)",
            [[30.0, 20.0]] * 3 + [[30.0, 65.0 - BOUNDARY_OFFSET], [30.0, -25.0 + BOUNDARY_OFFSET]],
        ),
        (
            "45 + 1e-9 from the mean along a meridian (rejected)",
            [[30.0, 20.0]] * 3 + [[30.0, 65.0 + BOUNDARY_OFFSET], [30.0, -25.0 - BOUNDARY_OFFSET]],
        ),
        (
            "antipode of the mean",
            [[123.4, -37.2]] * 5 + [[303.4, 37.2]],
        ),
        (
            "declination wrap 0 / 360 with one outlier",
            [[358.0, 30.0], [2.0, 31.0], [359.5, 28.0], [0.0, 30.0], [360.0, 30.0], [1.0, 29.0], [60.0, 30.0]],
        ),
        (
            "vertical mean, declinations spread, one shallow direction",
            [[0.0, 89.0], [120.0, 89.0], [240.0, 89.0], [17.0, 40.0], [200.0, 44.0]],
        ),
    ]
    datasets = []
    for name, directions in edges:
        datasets.append({"name": f"edge {name}", "directions": directions, "pmagpy": oracle(pmag, directions)})

    # Exactly 45 degrees: which side float noise puts it on is not meaningful, so no set is compared.
    exact_boundary = [[30.0, 20.0]] * 3 + [[30.0, 65.0], [30.0, -25.0]]
    tie = {"name": "edge exactly 45 from the mean (tie)", "directions": exact_boundary, "pmagpy": oracle(pmag, exact_boundary)}
    return datasets, tie


def main() -> None:
    pmag = require_pmagpy()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    edges, tie = edge_datasets(pmag)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": "mean = pmag.fisher_mean(directions); angle_i = pmag.angle(direction_i, mean); rejected = angle > 45",
        "vandammeNote": "reference only: pmag.dovandamme fed vgp_lat = 90 - angle to the Fisher mean (mean as pole)",
        "seed": SEED,
        "cutoffAngle": CUTOFF_ANGLE,
        "realFiles": real_file_datasets(pmag),
        "synthetic": synthetic_datasets(pmag),
        "edges": edges,
        "exactBoundary": tie,
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2, allow_nan=False) + "\n")
    print(f"[pb08] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
