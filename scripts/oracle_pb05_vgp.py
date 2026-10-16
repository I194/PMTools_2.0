#!/usr/bin/env python3
"""PB-05 oracle: virtual geomagnetic poles against pmag.dia_vgp / pmag.plat / pmag.fisher_mean.

Writes src/__tests__/fixtures/part_b/pb05_vgp.pmagpy.json with seeded synthetic directions and
sites, edge cases, a declination-on-the-site-meridian sweep, real-file scenarios and pole sets,
each with the PmagPy result.

Live PMTools path: VGPmodalContent.calculateVGPs reverses the user-selected directions
((dec + 180) % 360, -inc), rounds dec/inc with toFixed(1), takes a95 from the MAD column and calls
calculateVGP(dec, inc, siteLat, siteLon, a95); VGP/Graphs.tsx then takes fisherMean over
Direction(poleLongitude, poleLatitude) of every VGP. The oracle reproduces that preprocessing,
calls pmag.dia_vgp(dec, inc, a95, siteLat, siteLon) and pmag.fisher_mean([[plon, plat], ...]).

Run:  python3 scripts/oracle_pb05_vgp.py
(src/__tests__/fixtures/ is in .prettierignore; the script writes the final layout itself.)
"""

from __future__ import annotations

import itertools
import json
import math
import re

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb05_vgp.pmagpy.json"
SITES = {
    "Moscow": (55.75, 37.62),
    "Santiago": (-33.45, -70.66),
}
# (file, site, reverse rows with negative inclination before the conversion)
REAL_FILE_SCENARIOS = [
    ("src/assets/examples/exampleDIR.pmm", "Moscow", False),
    ("src/assets/examples/exampleDIR.pmm", "Moscow", True),
    ("test-data/sample.dir", "Moscow", False),
    ("test-data/sample.dir", "Moscow", True),
    ("test-data/sample.dir", "Santiago", False),
]


def to_fixed_one(value: float) -> float:
    """JavaScript `+value.toFixed(1)`; exact ties cannot occur for one-decimal inputs plus 180."""
    return float(f"{value:.1f}")


def vgp_oracle(pmag, declination, inclination, a95, site_latitude, site_longitude):
    pole_longitude, pole_latitude, dp, dm = pmag.dia_vgp(
        declination, inclination, a95, site_latitude, site_longitude
    )
    return [
        float(pole_longitude),
        float(pole_latitude),
        float(pmag.plat(inclination)),
        float(dp),
        float(dm),
    ]


def fisher_oracle(pmag, poles):
    result = pmag.fisher_mean([[longitude, latitude] for longitude, latitude in poles])
    if "n" not in result:
        # PmagPy returns only dec/inc for N < 2.
        return {"plon": float(result["dec"]), "plat": float(result["inc"])}
    return {
        "plon": float(result["dec"]),
        "plat": float(result["inc"]),
        "a95": float(result["alpha95"]),
        "k": None if result["k"] == "inf" else float(result["k"]),
        "n": int(result["n"]),
        "r": float(result["r"]),
        "csd": float(result["csd"]),
    }


def point_case(pmag, name, declination, inclination, site_latitude, site_longitude, a95):
    return {
        "name": name,
        "input": [declination, inclination, site_latitude, site_longitude, a95],
        "pmagpy": vgp_oracle(pmag, declination, inclination, a95, site_latitude, site_longitude),
    }


def synthetic_cases(pmag):
    rng = np.random.default_rng(SEED)
    cases = []
    for index in range(30):
        cases.append(
            point_case(
                pmag,
                f"random unrounded {index}",
                float(rng.uniform(0, 360)),
                float(rng.uniform(-89, 89)),
                float(rng.uniform(-89, 89)),
                float(rng.uniform(-180, 180)),
                float(rng.uniform(0.5, 20)),
            )
        )
    index = 0
    while index < 30:
        declination = to_fixed_one(float(rng.uniform(0, 360)))
        inclination = to_fixed_one(float(rng.uniform(-89, 89)))
        site_latitude = float(rng.uniform(-89, 89))
        site_longitude = float(rng.uniform(-180, 180))
        a95 = to_fixed_one(float(rng.uniform(0.5, 20)))
        if declination % 180 == 0:
            continue  # the site-meridian family is covered by the sweep below
        cases.append(
            point_case(
                pmag,
                f"random UI-rounded {index}",
                declination,
                inclination,
                site_latitude,
                site_longitude,
                a95,
            )
        )
        index += 1

    edges = [
        ("pmag.dia_vgp docstring, a95 0", 4, 41, 33, -117, 0),
        ("pmag.dia_vgp docstring, a95 6.2", 4, 41, 33, -117, 6.2),
        ("regular northern", 20, 45, 55, 60, 5),
        ("negative longitude wraps to 0..360", 250, 35, 30, 0, 3),
        ("southern site, reverse direction", 300, -30, -45, 120, 4),
        ("reverse direction gives southern pole", 190, -55, 50, 30, 7),
        ("horizontal inclination", 30, 0, 40, 10, 5),
        ("inclination 89.9", 30, 89.9, 40, 10, 5),
        ("inclination -89.9", 30, -89.9, 40, 10, 5),
        ("declination 0.1", 0.1, 45, 30, 40, 5),
        ("declination 359.9", 359.9, 45, 30, 40, 5),
        ("declination 179.9", 179.9, -45, 30, 40, 5),
        ("site longitude -180", 20, 45, 55, -180, 5),
        ("site longitude 179.9", 20, 45, 55, 179.9, 5),
        ("equatorial site", 100, 20, 0, 0, 5),
        ("site latitude 89.9", 30, 45, 89.9, 10, 5),
        ("site latitude -89.9", 30, 45, -89.9, 10, 5),
    ]
    cases.extend(point_case(pmag, *edge) for edge in edges)
    return cases


def meridian_sweep(pmag):
    """Declination exactly 0/180/360 (values toFixed(1) produces) over an inclination x site grid."""
    rows = []
    for declination, inclination, site_latitude in itertools.product(
        [0, 180, 360], range(-80, 81, 20), range(-80, 81, 20)
    ):
        rows.append(
            [declination, inclination, site_latitude]
            + vgp_oracle(pmag, declination, inclination, 5, site_latitude, 40)
        )
    return {
        "siteLongitude": 40,
        "a95": 5,
        "columns": ["dec", "inc", "siteLat", "plon", "plat", "paleoLat", "dp", "dm"],
        "rows": rows,
    }


def degenerate_cases(pmag):
    """Pole longitude undefined (site or pole at a geographic pole): only latitude is comparable."""
    edges = [
        ("site at the north pole", 30, 45, 90, 10, 5),
        ("site at the south pole", 30, 45, -90, 10, 5),
        ("pole at the north pole", 0, 0, 0, 10, 5),
    ]
    return [point_case(pmag, *edge) for edge in edges]


def mismatch_cases(pmag):
    edges = [
        ("declination 180 on the site meridian", 180, 45, 30, 40, 5),
        ("site longitude 350 in the 0..360 convention", 20, 45, 55, 350, 5),
        ("inclination exactly 90", 30, 90, 40, 10, 5),
        ("inclination exactly -90", 30, -90, 40, 10, 5),
    ]
    return [point_case(pmag, *edge) for edge in edges]


def read_directions(relative_path):
    """Geographic dec, inc, MAD as parsePMM / parseDIR read them (geo == strat in both files)."""
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines() if len(line) > 1]
    rows = []
    if relative_path.endswith(".pmm"):
        for line in lines[3:]:
            params = "".join(line.split()).split(",")
            rows.append([params[0], float(params[4]), float(params[5]), float(params[7])])
    else:
        for line in lines:
            rows.append(
                [line[0:7].strip(), float(line[27:33]), float(line[33:39]), float(line[51:58])]
            )
    return rows


def real_file_scenarios(pmag):
    scenarios = []
    for relative_path, site_name, reverse_negative in REAL_FILE_SCENARIOS:
        site_latitude, site_longitude = SITES[site_name]
        inputs, outputs, reversed_ids = [], [], []
        for row_id, (_label, declination, inclination, a95) in enumerate(
            read_directions(relative_path), start=1
        ):
            # Reversal is keyed by row id, like reversedDirectionsIDs (labels repeat in exampleDIR.pmm).
            if reverse_negative and inclination < 0:
                reversed_ids.append(row_id)
                declination, inclination = (declination + 180) % 360, -inclination
            declination, inclination = to_fixed_one(declination), to_fixed_one(inclination)
            inputs.append([declination, inclination, a95])
            outputs.append(
                vgp_oracle(pmag, declination, inclination, a95, site_latitude, site_longitude)
            )
        scenarios.append(
            {
                "path": relative_path,
                "site": site_name,
                "siteLatitude": site_latitude,
                "siteLongitude": site_longitude,
                "reversedIds": reversed_ids,
                "inputs": inputs,
                "pmagpy": outputs,
                "meanPole": fisher_oracle(pmag, [(row[0], row[1]) for row in outputs]),
            }
        )
    return scenarios


def pole_sets(pmag):
    rng = np.random.default_rng(SEED + 1)
    sets = {
        "N = 1": [[204.695, 58.04015]],
        "N = 2": [[204.695, 58.04015], [210, 55]],
        "three close poles": [[300.5, 70.2], [310.1, 72.9], [295, 68]],
        "across the 0/360 seam": [[359, 60], [1, 61], [358.5, 59.5]],
        "southern poles": [[120, -75], [140, -80], [100, -70], [135, -72]],
        "mixed polarity": [[30, 40], [215, -35], [40, 50]],
    }
    for size, kappa in [(10, 30), (40, 80)]:
        poles = []
        for _ in range(size):
            # Inverse-CDF sample of the Fisher colatitude about the north pole.
            uniform = rng.uniform()
            cosine = 1 + math.log(1 - uniform * (1 - math.exp(-2 * kappa))) / kappa
            colatitude = math.degrees(math.acos(cosine))
            longitude = float(rng.uniform(0, 360))
            poles.append([longitude, 90 - colatitude])
        sets[f"Fisher-distributed N = {size}, kappa {kappa}"] = poles
    return [
        {"name": name, "poles": poles, "pmagpy": fisher_oracle(pmag, poles)}
        for name, poles in sets.items()
    ]


def main() -> None:
    pmag = require_pmagpy()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": "pmag.dia_vgp(dec, inc, a95, siteLat, siteLon) -> [plon, plat, pmag.plat(inc), dp, dm]; "
        "mean pole pmag.fisher_mean([[plon, plat], ...])",
        "seed": SEED,
        "synthetic": synthetic_cases(pmag),
        "meridianSweep": meridian_sweep(pmag),
        "degenerate": degenerate_cases(pmag),
        "mismatches": mismatch_cases(pmag),
        "realFiles": real_file_scenarios(pmag),
        "poleSets": pole_sets(pmag),
    }
    text = json.dumps(fixture, indent=2)
    # Keep each innermost scalar array on one line so the fixture stays small and row-shaped.
    text = re.sub(
        r"\[\s+([^\[\]{}]*?)\s+\]",
        lambda match: "[" + re.sub(r",\s+", ", ", match.group(1)) + "]",
        text,
    )
    OUTPUT_PATH.write_text(text + "\n")
    print(f"[pb05] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
