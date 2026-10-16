#!/usr/bin/env python3
"""PB-01 oracle: specimen -> geographic -> stratigraphic against pmag.dogeo / pmag.dotilt.

Writes src/__tests__/fixtures/part_b/pb01_reference_coordinates.pmagpy.json with the
synthetic cases (seeded) and the steps of two real .pmd files, each with the PmagPy result.

Orientation adapter (PB-00): a .pmd header holds the core hade b; the PMTools store keeps
90 - b (parsedData.ts:45), so the lab-arrow plunge PmagPy expects is -b = pmag.orient or_con 1.
Dip direction = strike + 90 (right-hand rule), the same mapping PmagPy's PMD importer uses.

Run:  python3 scripts/oracle_pb01_reference_coordinates.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb01_reference_coordinates.pmagpy.json
"""

from __future__ import annotations

import itertools
import json

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb01_reference_coordinates.pmagpy.json"
REAL_FILES = ["src/assets/examples/examplePCA.pmd", "test-data/sample.pmd"]


def oracle(pmag, x, y, z, core_azimuth, core_hade, bedding_strike, bedding_dip):
    specimen_declination, specimen_inclination, _ = pmag.cart2dir([x, y, z])
    geographic = pmag.dogeo(specimen_declination, specimen_inclination, core_azimuth, -core_hade)
    stratigraphic = pmag.dotilt(geographic[0], geographic[1], bedding_strike + 90, bedding_dip)
    return {
        "geographic": [float(geographic[0]), float(geographic[1])],
        "stratigraphic": [float(stratigraphic[0]), float(stratigraphic[1])],
    }


def synthetic_cases(pmag):
    rng = np.random.default_rng(SEED)
    cases = []
    for index in range(40):
        vector = rng.normal(size=3)
        orientation = {
            "a": float(rng.uniform(0, 360)),
            "b": float(rng.uniform(0, 180)),
            "s": float(rng.uniform(0, 360)),
            "d": float(rng.uniform(0, 180)),
        }
        cases.append({"name": f"random {index}", "xyz": vector.tolist(), **orientation})

    # Edge grid: declination wrap, vertical and horizontal cores, vertical and overturned beds.
    edge_vectors = {"north": [1, 0, 0], "east": [0, 1, 0], "down": [0, 0, 1], "oblique": [1, -1, 0.5]}
    for (vector_name, vector), core_azimuth, core_hade, (bedding_strike, bedding_dip) in itertools.product(
        edge_vectors.items(),
        [0, 359.9],
        [0, 70, 90],
        [(0, 0), (51, 90), (300, 120)],
    ):
        cases.append(
            {
                "name": f"edge {vector_name} a={core_azimuth} b={core_hade} s={bedding_strike} d={bedding_dip}",
                "xyz": [float(component) for component in vector],
                "a": core_azimuth,
                "b": core_hade,
                "s": bedding_strike,
                "d": bedding_dip,
            }
        )

    for case in cases:
        case["pmagpy"] = oracle(pmag, *case["xyz"], case["a"], case["b"], case["s"], case["d"])
    return cases


def real_file_cases(pmag):
    files = []
    for relative_path in REAL_FILES:
        lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:] if len(line) > 1]
        header = lines[0]
        a, b, s, d = (float(header[start:end]) for start, end in [(12, 20), (22, 30), (32, 40), (42, 50)])
        steps = []
        for line in lines[2:]:
            x, y, z = (float(line[start:end]) for start, end in [(4, 14), (14, 24), (24, 34)])
            steps.append({"step": line[0:4].strip(), "pmagpy": oracle(pmag, x, y, z, a, b, s, d)})
        files.append({"path": relative_path, "a": a, "b": b, "s": s, "d": d, "steps": steps})
    return files


def main() -> None:
    pmag = require_pmagpy()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": "pmag.dogeo(D, I, a, -b) then pmag.dotilt(D, I, s + 90, d); b is the file's core hade",
        "seed": SEED,
        "synthetic": synthetic_cases(pmag),
        "realFiles": real_file_cases(pmag),
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2) + "\n")
    print(f"[pb01] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
