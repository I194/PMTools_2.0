#!/usr/bin/env python3
"""PB-11 oracle: bootstrap fold test (Tauxe & Watson 1994) against PmagPy primitives.

Writes src/__tests__/fixtures/part_b/pb11_fold_test.pmagpy.json with
  1. real files (sample.dir, exampleDIR.pmm, two_limb_fold.dir): the bedding of each row
     recovered independently from its geographic/stratigraphic pair, the tau1 curve on the
     10 % grid and the best untilting on the 1 % grid;
  2. a seeded synthetic fold with known beddings (gentle, vertical, overturned) at full precision;
  3. the bootstrap: (a) a replay that draws the same resample indices as PMTools under the
     seeded generator of src/test-utils/seededRandom.ts, (b) an independent numpy-seeded run.

ipmag.bootstrap_fold_test (ipmag.py:938) only prints and plots, so its loop is rebuilt from the
primitives it calls: pmag.pseudo resampling (ipmag.py:1025), pmag.dotilt_V at perc % of the dip
(ipmag.py:1032-1034), pmag.doprinc tau1 (ipmag.py:1036-1037), first argmax over the percentages
(ipmag.py:1042) and the bounds Untilt[int(.025 n)], Untilt[int(.975 n)] (ipmag.py:1047-1050).
The percentage range is PMTools' -50..150 % (ipmag's default is -10..119 %).

Run:  python3 scripts/oracle_pb11_fold_test.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb11_fold_test.pmagpy.json
"""

from __future__ import annotations

import json

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb11_fold_test.pmagpy.json"
COARSE_GRID = list(range(-50, 151, 10))
FINE_GRID = list(range(-50, 151))
NUMBER_OF_SIMULATIONS = 1000
LCG_MULTIPLIER, LCG_INCREMENT, LCG_MODULUS = 1664525, 1013904223, 2**32
BOOTSTRAP_FILES = ["test-data/v2.6.6/sci-01/two_limb_fold.dir", "test-data/sample.dir"]
# Data seed picked (seeds 1-4 tried) so that the replayed 95 % lower bound is exactly 0 %.
SYN_FOLDING_DATA_SEED = 4


def read_dir_file(relative_path):
    """Fixed-width .dir columns, the same slices as parserDIR.ts."""
    rows = []
    for line in (REPO_ROOT / relative_path).read_text().splitlines():
        if len(line) <= 1:
            continue
        rows.append([float(line[start:end]) for start, end in [(27, 33), (33, 39), (39, 45), (45, 51)]])
    return rows


def read_pmm_file(relative_path):
    """Comma-separated .pmm rows after the three header lines; Dg, Ig, Ds, Is are columns 4, 5, 8, 9."""
    rows = []
    for line in (REPO_ROOT / relative_path).read_text().splitlines()[3:]:
        cells = [cell.strip() for cell in line.split(",")]
        if len(cells) > 9:
            rows.append([float(cells[column]) for column in (4, 5, 8, 9)])
    return rows


def recover_bedding(pmag, geographic, stratigraphic):
    """The tilt correction is a rotation about the horizontal strike line, and that line must be
    equidistant from both directions, so it is horizontal and normal to (S - G). Returns
    [dip direction, dip] with dip in [0, 180] such that pmag.dotilt(G) == S, or None when G == S."""
    geographic_vector = np.array(pmag.dir2cart([geographic[0], geographic[1], 1.0]))
    stratigraphic_vector = np.array(pmag.dir2cart([stratigraphic[0], stratigraphic[1], 1.0]))
    strike_axis = np.cross([0.0, 0.0, 1.0], stratigraphic_vector - geographic_vector)
    if np.linalg.norm(strike_axis) < 1e-12:
        return None
    strike_axis /= np.linalg.norm(strike_axis)
    geographic_in_plane = geographic_vector - np.dot(geographic_vector, strike_axis) * strike_axis
    stratigraphic_in_plane = stratigraphic_vector - np.dot(stratigraphic_vector, strike_axis) * strike_axis
    rotation_angle = float(
        np.degrees(
            np.arctan2(
                np.linalg.norm(np.cross(geographic_in_plane, stratigraphic_in_plane)),
                np.dot(geographic_in_plane, stratigraphic_in_plane),
            )
        )
    )
    strike = float(np.degrees(np.arctan2(strike_axis[1], strike_axis[0])))
    candidates = []
    for dip_direction in ((strike + 90) % 360, (strike - 90) % 360):
        corrected = pmag.dotilt(geographic[0], geographic[1], dip_direction, rotation_angle)
        residual = np.linalg.norm(np.array(pmag.dir2cart([corrected[0], corrected[1], 1.0])) - stratigraphic_vector)
        candidates.append((residual, dip_direction))
    residual, dip_direction = min(candidates)
    assert residual < 1e-9, f"bedding recovery failed: residual {residual}"
    return [dip_direction, rotation_angle]


def tau1_at(pmag, data_with_bedding, percent):
    """ipmag.py:1032-1037: untilt by percent of the dip, then tau1 of pmag.doprinc."""
    tilt = np.array([1.0, 1.0, 1.0, 0.01 * percent])
    declinations, inclinations = pmag.dotilt_V(data_with_bedding * tilt)
    return float(pmag.doprinc(np.array([declinations, inclinations]).transpose())["tau1"])


def best_untilt(pmag, data_with_bedding):
    """ipmag.py:1042: the first percentage of the 1 % grid with the largest tau1."""
    taus = [tau1_at(pmag, data_with_bedding, percent) for percent in FINE_GRID]
    return FINE_GRID[taus.index(max(taus))]


def with_recovered_beddings(pmag, directions):
    data, beddings = [], []
    for geographic_declination, geographic_inclination, stratigraphic_declination, stratigraphic_inclination in directions:
        bedding = recover_bedding(
            pmag,
            (geographic_declination, geographic_inclination),
            (stratigraphic_declination, stratigraphic_inclination),
        )
        beddings.append(bedding)
        data.append([geographic_declination, geographic_inclination, *(bedding or [0.0, 0.0])])
    return np.array(data), beddings


def deterministic_case(pmag, name, directions):
    data, beddings = with_recovered_beddings(pmag, directions)
    return {
        "name": name,
        "directions": directions,
        "pmagpyBeddings": beddings,
        "tau1Curve": [tau1_at(pmag, data, percent) for percent in COARSE_GRID],
        "bestUntilt": best_untilt(pmag, data),
    }


def synthetic_case(pmag):
    rng = np.random.default_rng(SEED)
    beddings = [
        [0.0, 5.0], [45.0, 25.0], [90.0, 40.0], [135.0, 60.0], [180.0, 75.0], [225.0, 89.0],
        [270.0, 90.0], [315.0, 91.0], [359.5, 110.0], [10.0, 135.0], [200.0, 160.0], [300.0, 170.0],
        [float(rng.uniform(0, 360)), float(rng.uniform(1, 179))],
        [float(rng.uniform(0, 360)), float(rng.uniform(1, 179))],
        [float(rng.uniform(0, 360)), float(rng.uniform(1, 179))],
        [float(rng.uniform(0, 360)), float(rng.uniform(1, 179))],
    ]
    directions = []
    for dip_direction, dip in beddings:
        declination, inclination = pmag.fshdev(30, random_seed=rng)
        stratigraphic = pmag.dodirot(declination, inclination, 350.0, 45.0)
        geographic = pmag.dotilt(stratigraphic[0], stratigraphic[1], dip_direction, -dip)
        directions.append([float(geographic[0]), float(geographic[1]), float(stratigraphic[0]), float(stratigraphic[1])])
    case = deterministic_case(pmag, "synthetic fold, known beddings, unrounded", directions)
    case["trueBeddings"] = beddings
    return case


def syn_folding_directions(pmag):
    """Two limbs (dip directions 90/270, dips 25-60), Fisher kappa 150, tightest at 6 % untilting
    (magnetised late in folding); rounded to 0.1 degree like a .dir file."""
    rng = np.random.default_rng(SYN_FOLDING_DATA_SEED)
    sites_per_limb = 8
    dips = np.tile(np.linspace(25, 60, sites_per_limb), 2)
    directions = []
    for site, dip in enumerate(dips):
        dip_direction = 90.0 if site < sites_per_limb else 270.0
        declination, inclination = pmag.fshdev(150, random_seed=rng)
        reference = pmag.dodirot(declination, inclination, 10.0, 50.0)
        geographic = pmag.dotilt(reference[0], reference[1], dip_direction, -dip * 0.06)
        stratigraphic = pmag.dotilt(geographic[0], geographic[1], dip_direction, dip)
        directions.append([round(float(value), 1) for value in (*geographic, *stratigraphic)])
    return directions


def seeded_random_indices(seed, number_of_draws, number_of_rows):
    """The generator of src/test-utils/seededRandom.ts, consumed as drawBootstrap does: floor(u * N)."""
    state = seed % LCG_MODULUS
    indices = []
    for _ in range(number_of_draws):
        state = (state * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS
        indices.append(int(state / LCG_MODULUS * number_of_rows))
    return indices


def bootstrap_case(pmag, name, directions):
    data, _ = with_recovered_beddings(pmag, directions)
    number_of_rows = len(data)

    indices = seeded_random_indices(SEED, NUMBER_OF_SIMULATIONS * number_of_rows, number_of_rows)
    replay_untilts = [
        best_untilt(pmag, data[indices[simulation * number_of_rows : (simulation + 1) * number_of_rows]])
        for simulation in range(NUMBER_OF_SIMULATIONS)
    ]

    rng = np.random.default_rng(SEED)
    independent_untilts = sorted(
        best_untilt(pmag, pmag.pseudo(data, random_seed=rng)) for _ in range(NUMBER_OF_SIMULATIONS)
    )
    return {
        "name": name,
        "directions": directions,
        "numberOfSimulations": NUMBER_OF_SIMULATIONS,
        "replayUntilts": replay_untilts,
        "independentSortedUntilts": independent_untilts,
        "independentBounds95": [
            independent_untilts[int(0.025 * NUMBER_OF_SIMULATIONS)],
            independent_untilts[int(0.975 * NUMBER_OF_SIMULATIONS)],
        ],
    }


def main() -> None:
    pmag = require_pmagpy()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": "tau1 = pmag.doprinc(pmag.dotilt_V([D, I, dipDirection, dip * p / 100]))['tau1']; "
        "bootstrap loop of ipmag.bootstrap_fold_test on the -50..150 % grid",
        "seed": SEED,
        "coarseGrid": COARSE_GRID,
        "realFiles": [
            deterministic_case(pmag, "test-data/sample.dir", read_dir_file("test-data/sample.dir")),
            deterministic_case(pmag, "src/assets/examples/exampleDIR.pmm", read_pmm_file("src/assets/examples/exampleDIR.pmm")),
            {
                **deterministic_case(
                    pmag,
                    "test-data/v2.6.6/sci-01/two_limb_fold.dir",
                    read_dir_file("test-data/v2.6.6/sci-01/two_limb_fold.dir"),
                ),
                "trueBeddings": json.loads((REPO_ROOT / "test-data/v2.6.6/sci-01/oracle.json").read_text())["cases"][0][
                    "beddings_dip_azimuth_dip"
                ],
            },
        ],
        "synthetic": synthetic_case(pmag),
        "bootstrap": [
            *(bootstrap_case(pmag, relative_path, read_dir_file(relative_path)) for relative_path in BOOTSTRAP_FILES),
            bootstrap_case(pmag, "synthetic late syn-folding magnetisation", syn_folding_directions(pmag)),
        ],
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2) + "\n")
    print(f"[pb11] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
