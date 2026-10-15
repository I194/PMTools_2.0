"""Generate the two SCI-01 verification datasets and their PmagPy oracle answers.

Both are synthetic folds with a KNOWN answer: a tight Fisher cluster of pre-fold
("stratigraphic") directions is folded down onto per-site beddings, so unfolding to
100 % recovers the cluster and the fold test must peak near 100 %.

  two_limb_fold.dir   -- a classic two-limb fold, dips 25..60, both limbs. Exercises the
                         call-site fix (SCI-01). Before the fix PMTools read 150 % here.
  overturned_limb.dir -- the same cluster with one limb overturned (dips 95..140) and
                         the beddings chosen so findBed lands in the (180, 270) branch.
                         Exercises the findBed normalization (NEW-A).

The PmagPy answers are written next to the files in oracle.json. Note that PMTools runs a
1000-draw bootstrap, so its *bounds* are stochastic; the number to compare against the
oracle is the best-unfolding percentage, and it is a finite-sample optimum -- expect a few
per cent of spread, not an exact match.

Run:  python3 test-data/v2.6.6/sci-01/gen_sci01_verification_data.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from pmagpy import pmag

OUTPUT_DIRECTORY = Path(__file__).resolve().parent
SEED = 2026
GRID = list(range(-50, 151, 1))


def build_folded_dataset(beddings, kappa=50, mean_declination=35.0, mean_inclination=45.0):
    """Fisher cluster -> fold it onto `beddings` -> rounded (Dgeo, Igeo, Dstrat, Istrat)."""
    rng = np.random.default_rng(SEED)
    rows = []
    for dip_azimuth, dip in beddings:
        declination, inclination = pmag.fshdev(kappa, random_seed=rng)
        declination, inclination = pmag.dodirot(
            declination, inclination, mean_declination, mean_inclination
        )
        # Fold the pre-fold direction down onto the bed: the inverse tilt correction.
        geographic_declination, geographic_inclination = pmag.dotilt(
            declination, inclination, dip_azimuth, -dip
        )
        rows.append(
            (
                round(geographic_declination, 1),
                round(geographic_inclination, 1),
                round(declination, 1),
                round(inclination, 1),
            )
        )
    return rows


def tau1_at(geographic_directions, beddings, percent):
    """Largest normalised eigenvalue of the orientation matrix at `percent` untilting."""
    corrected = [
        pmag.dotilt(declination, inclination, dip_azimuth, dip * percent / 100.0)
        for (declination, inclination), (dip_azimuth, dip) in zip(
            geographic_directions, beddings
        )
    ]
    scatter = np.zeros((3, 3))
    for declination, inclination in corrected:
        cartesian = pmag.dir2cart([declination, inclination, 1.0])
        scatter += np.outer(cartesian, cartesian)
    eigenvalues = np.sort(np.linalg.eigvalsh(scatter))[::-1]
    return float(eigenvalues[0] / eigenvalues.sum())


def write_dir_file(path, rows, comment):
    """Write the fixed-width .dir layout parserDIR.ts expects (see its slice offsets)."""
    lines = []
    for number, (dgeo, igeo, dstrat, istrat) in enumerate(rows, start=1):
        label = f"S{number:02d}".ljust(7)
        code = "Dir".ljust(7)
        step_range = "T200-T580".ljust(10)
        step_count = "  8"
        line = (
            label
            + code
            + step_range
            + step_count
            + f"{dgeo:6.1f}{igeo:6.1f}{dstrat:6.1f}{istrat:6.1f}"
            + f"{3.5:7.1f}{95.0:6.1f}"
            + comment
        )
        lines.append(line)
    path.write_text("\n".join(lines) + "\n")


def build_case(name, beddings, comment):
    rows = build_folded_dataset(beddings)
    write_dir_file(OUTPUT_DIRECTORY / f"{name}.dir", rows, comment)
    geographic_directions = [(dgeo, igeo) for dgeo, igeo, _, _ in rows]
    best = max(GRID, key=lambda percent: tau1_at(geographic_directions, beddings, percent))
    return {
        "file": f"{name}.dir",
        "sites": len(rows),
        "beddings_dip_azimuth_dip": [
            [float(dip_azimuth), float(dip)] for dip_azimuth, dip in beddings
        ],
        "pmagpy_best_untilt_percent_1pct_grid": best,
        "pmagpy_tau1_at_0_percent": round(tau1_at(geographic_directions, beddings, 0), 6),
        "pmagpy_tau1_at_best": round(tau1_at(geographic_directions, beddings, best), 6),
    }


def main() -> None:
    # Two limbs dipping away from each other, the textbook fold-test geometry.
    two_limb_beddings = [(90.0, dip) for dip in np.linspace(25, 60, 9)] + [
        (270.0, dip) for dip in np.linspace(25, 60, 9)
    ]
    # One upright limb, one overturned. The dip azimuths are picked so that findBed's
    # cosdip/sindip solve lands in the branch NEW-A normalizes.
    overturned_beddings = [(230.0, dip) for dip in np.linspace(95, 140, 9)] + [
        (340.0, dip) for dip in np.linspace(20, 55, 9)
    ]

    oracle = {
        "pmagpy_version": pmag.get_version(),
        "seed": SEED,
        "note": (
            "Verification data for SCI-01. Both datasets are synthetic folds whose true "
            "optimum is 100 % by construction; the numbers below are PmagPy's fold test on "
            "a 1 % grid, which lands a few per cent off 100 because each is a finite sample. "
            "PMTools runs a 1000-draw bootstrap, so compare the best-unfolding percentage, "
            "not the bounds."
        ),
        "cases": [
            build_case("two_limb_fold", two_limb_beddings, "two-limb fold"),
            build_case("overturned_limb", overturned_beddings, "overturned limb"),
        ],
    }
    (OUTPUT_DIRECTORY / "oracle.json").write_text(json.dumps(oracle, indent=2) + "\n")
    print(json.dumps(oracle, indent=2))


if __name__ == "__main__":
    main()
