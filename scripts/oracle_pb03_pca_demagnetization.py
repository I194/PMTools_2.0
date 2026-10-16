#!/usr/bin/env python3
"""PB-03 oracle: PCA on demagnetization steps (modes pca, pca0, gc, gcn) against PmagPy.

Writes src/__tests__/fixtures/part_b/pb03_pca_demagnetization.pmagpy.json with contiguous step
ranges of two real .pmd files and of seeded synthetic demagnetization paths, each with the
PmagPy result for every PMTools mode. All fits are in the specimen frame (rotation is PB-01).

Oracle per mode (decided in PB-00):
  pca  -> pmag.domean 'DE-BFL' (centred, intensity-weighted, sign v1 . (first - last) >= 0)
  pca0 -> MAD from domean 'DE-BFL-A'; direction from pmag.Tmatrix + pmag.tauV on the raw xyz
          (principal eigenvector, sign by first - last), because DE-BFL-A returns
          pmag.vector_mean as its direction (kept here as vectorMean for one convention check)
  gc   -> no PmagPy function keeps intensities for a plane: pmag.Tmatrix + pmag.tauV on the
          raw xyz, minimum eigenvector as the pole, thesis plane MAD (1.2) from those taus
  gcn  -> pmag.domean 'DE-BFP' (unit vectors, no centring); its pole has no sign rule

Run:  python3 scripts/oracle_pb03_pca_demagnetization.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb03_pca_demagnetization.pmagpy.json
"""

from __future__ import annotations

import json

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb03_pca_demagnetization.pmagpy.json"

# 1-based inclusive step ranges, the same numbering as PMTools selectedStepsIDs.
REAL_FILE_RANGES = {
    "src/assets/examples/examplePCA.pmd": [(1, 15), (1, 5), (3, 8), (6, 12), (6, 15), (9, 15), (12, 15)],
    "test-data/sample.pmd": [(1, 8), (1, 4), (2, 6), (3, 8), (5, 8)],
}


def unit_vector(declination, inclination):
    declination, inclination = np.radians(declination), np.radians(inclination)
    return np.array(
        [np.cos(inclination) * np.cos(declination), np.cos(inclination) * np.sin(declination), np.sin(inclination)]
    )


def direction_of(pmag, vector):
    declination, inclination, _ = pmag.cart2dir([float(component) for component in vector])
    return float(declination), float(inclination)


def domean(pmag, steps, first, last, calculation_type):
    rows = []
    for index, step in enumerate(steps):
        declination, inclination, intensity = pmag.cart2dir(step)
        rows.append([index, float(declination), float(inclination), float(intensity), "", "g"])
    return pmag.domean(rows, first - 1, last - 1, calculation_type)


def raw_eigen_decomposition(pmag, selected_steps):
    taus, eigenvectors = pmag.tauV(np.array(pmag.Tmatrix(selected_steps)))
    return [float(np.real(tau)) for tau in taus], [np.real(np.array(vector)) for vector in eigenvectors]


def fit_range(pmag, steps, first, last):
    selected_steps = steps[first - 1 : last]
    first_minus_last = np.array(selected_steps[0]) - np.array(selected_steps[-1])

    free_line = domean(pmag, steps, first, last, "DE-BFL")
    anchored_line = domean(pmag, steps, first, last, "DE-BFL-A")
    unit_plane = domean(pmag, steps, first, last, "DE-BFP")

    taus, eigenvectors = raw_eigen_decomposition(pmag, selected_steps)
    principal = eigenvectors[0] if np.dot(eigenvectors[0], first_minus_last) >= 0 else -eigenvectors[0]
    # domean clamps a negative t3 to zero (pmag.py); apply the same before the thesis plane formula.
    tau1, tau2, tau3 = taus[0], taus[1], max(taus[2], 0.0)
    weighted_plane_mad = float(np.degrees(np.arctan(np.sqrt(tau3 / tau2 + tau3 / tau1))))

    return {
        "first": first,
        "last": last,
        "pca": {
            "dec": float(free_line["specimen_dec"]),
            "inc": float(free_line["specimen_inc"]),
            "mad": float(free_line["specimen_mad"]),
        },
        "pca0": {
            **dict(zip(["dec", "inc"], direction_of(pmag, principal))),
            "mad": float(anchored_line["specimen_mad"]),
            "vectorMean": [float(anchored_line["specimen_dec"]), float(anchored_line["specimen_inc"])],
        },
        "gc": {**dict(zip(["dec", "inc"], direction_of(pmag, eigenvectors[2]))), "mad": weighted_plane_mad},
        "gcn": {
            "dec": float(unit_plane["specimen_dec"]),
            "inc": float(unit_plane["specimen_inc"]),
            "mad": float(unit_plane["specimen_mad"]),
        },
    }


def two_component_path(rng, step_count, noise):
    overprint = unit_vector(rng.uniform(0, 360), rng.uniform(-80, 80)) * rng.uniform(0.3, 0.8)
    characteristic = unit_vector(rng.uniform(0, 360), rng.uniform(-80, 80))
    steps = []
    for index in range(step_count):
        overprint_left = max(0.0, 1 - index / 4)
        characteristic_left = 1.0 if index < 3 else max(0.02, 1 - (index - 2) / (step_count - 2))
        vector = overprint * overprint_left + characteristic * characteristic_left + rng.normal(scale=noise, size=3)
        steps.append(vector)
    return steps


def great_circle_path(rng, step_count, noise):
    start = unit_vector(rng.uniform(0, 360), rng.uniform(-80, 80))
    target = unit_vector(rng.uniform(0, 360), rng.uniform(-80, 80))
    pole = np.cross(start, target) / np.linalg.norm(np.cross(start, target))
    in_plane = np.cross(pole, start)
    steps = []
    for index in range(step_count):
        angle = np.radians(100 * index / (step_count - 1))
        magnitude = 1 - 0.8 * index / (step_count - 1)
        vector = magnitude * (np.cos(angle) * start + np.sin(angle) * in_plane) + rng.normal(scale=noise, size=3)
        steps.append(vector)
    return steps


def synthetic_specimens(rng):
    specimens = []
    for index in range(4):
        steps = two_component_path(rng, 12, 0.01)
        specimens.append({"name": f"two-component path {index}", "steps": steps, "ranges": [(1, 12), (1, 4), (5, 12), (7, 12)]})
    for index in range(3):
        steps = great_circle_path(rng, 10, 0.01)
        specimens.append({"name": f"great-circle path {index}", "steps": steps, "ranges": [(1, 10), (1, 6), (4, 10)]})

    # Real-file magnitudes (1e-8 Am2); the east noise is tiny so the fits straddle declination 0/360.
    wrap_steps = [
        unit_vector(0.0, 15.0) * 4e-8 * (1 - index / 9) + rng.normal(scale=4e-10, size=3) * [1, 1e-5, 1]
        for index in range(9)
    ]
    specimens.append({"name": "declination wrap at 1e-8 Am2", "steps": wrap_steps, "ranges": [(1, 9), (3, 9)]})
    steep_steps = [unit_vector(37.0, 89.9) * (1 - index / 8) + rng.normal(scale=0.005, size=3) for index in range(8)]
    specimens.append({"name": "near-vertical line", "steps": steep_steps, "ranges": [(1, 8)]})

    two_steps = [unit_vector(120.0, 40.0) * 1.0 + 0.1 * unit_vector(10.0, -20.0), unit_vector(120.0, 40.0) * 0.3]
    specimens.append({"name": "edge N=2", "steps": two_steps, "ranges": [(1, 2)]})
    three_steps = [unit_vector(200.0, 30.0), unit_vector(250.0, 10.0) * 0.6, unit_vector(300.0, -25.0) * 0.25]
    specimens.append({"name": "edge N=3", "steps": three_steps, "ranges": [(1, 3)]})

    for specimen in specimens:
        specimen["steps"] = [[float(component) for component in step] for step in specimen["steps"]]
    return specimens


def read_pmd_steps(relative_path):
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:] if len(line) > 1]
    return [
        [float(line[start:end]) for start, end in [(4, 14), (14, 24), (24, 34)]] for line in lines[2:]
    ], [line[0:4].strip() for line in lines[2:]]


def main() -> None:
    pmag = require_pmagpy()
    rng = np.random.default_rng(SEED)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    real_files = []
    for relative_path, ranges in REAL_FILE_RANGES.items():
        steps, labels = read_pmd_steps(relative_path)
        real_files.append(
            {
                "path": relative_path,
                "stepLabels": labels,
                "ranges": [fit_range(pmag, steps, first, last) for first, last in ranges],
            }
        )

    synthetic = []
    for specimen in synthetic_specimens(rng):
        synthetic.append(
            {
                "name": specimen["name"],
                "steps": specimen["steps"],
                "ranges": [fit_range(pmag, specimen["steps"], first, last) for first, last in specimen["ranges"]],
            }
        )

    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": {
            "pca": "pmag.domean DE-BFL specimen_dec/inc/mad",
            "pca0": "direction: pmag.Tmatrix + pmag.tauV principal eigenvector on raw xyz, sign v1 . (first - last) >= 0; "
            "mad: pmag.domean DE-BFL-A; vectorMean: DE-BFL-A dec/inc (pmag.vector_mean, a different estimator)",
            "gc": "pole: pmag.Tmatrix + pmag.tauV minimum eigenvector on raw xyz (axis); mad: thesis (1.2) on those taus",
            "gcn": "pmag.domean DE-BFP specimen_dec/inc (pole, no sign rule) and specimen_mad",
        },
        "seed": SEED,
        "realFiles": real_files,
        "synthetic": synthetic,
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2) + "\n")
    print(f"[pb03] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
