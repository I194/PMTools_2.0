"""Fold-test (deterministic core) fixture generator + PmagPy cross-check.

Unlike the other gen_*.py scripts (which read a committed *.input.json and emit a
PmagPy reference), this one GENERATES its own input: a seeded, synthetically-folded
dataset with a KNOWN true best-unfolding answer of ~100 %, used to characterise — and
cross-check — PMTools' deterministic fold-test core (`findBed` + `unfold`, exported
from src/.../FoldTest/foldTestBootstrap.ts).

Construction (seed 42, fully reproducible):
  1. Draw a tight Fisher cluster of "stratigraphic" (pre-fold) directions.
  2. Give each site a different bedding (dip direction `az`, dip).
  3. Re-fold each: geographic = dotilt(strat, az, -dip)  (inverse tilt correction).
     => geographic directions are scattered; unfolding to 100 % recovers the tight
        cluster, so the geologically correct fold-test optimum is ~100 % (100 % on the
        10 % grid PMTools/PmagPy use; ~98 % on a finer grid, from 0.1° rounding).

It then runs PmagPy's fold test (max normalised eigenvalue tau1 of the orientation
matrix vs untilting %) on the rounded geographic directions and records the curve +
optimum. PMTools' `unfold` on the SAME geo/strat pairs locks index = -17 % instead of
100 % — a confirmed convention bug (findBed returns azimuth = strike + 90, which
`unfold` then feeds to correctBedding as if it were a strike). See
.claude/development-roadmap/notes/found-bugs-todo.md ("Surfaced in Layer A").

Run:  python3 scripts/gen_foldtest.py --force
"""

from __future__ import annotations

import argparse
import json

import numpy as np

from _fixture_common import (
    FIXTURES_ROOT,
    pmagpy_version,
    require_pmagpy,
)

SEED = 42
FIXTURE_DIR = FIXTURES_ROOT / "computations" / "fold_unfold"
GRID = list(range(-50, 151, 10))


def build_dataset(pmag):
    """Return rounded [(Dgeo, Igeo, Dstrat, Istrat)] + per-site (az, dip) beddings."""
    # `pmag.fshdev` with `random_seed=None` draws from a fresh, unseeded numpy Generator
    # (OS entropy) that `np.random.seed` does NOT control — so pass it an explicit seeded
    # numpy Generator to make the dataset bit-reproducible across runs.
    rng = np.random.default_rng(SEED)
    mean_dec, mean_inc, kappa, n_sites = 30.0, 50.0, 40, 18
    strat = []
    for _ in range(n_sites):
        dec, inc = pmag.fshdev(kappa, random_seed=rng)   # Fisher deviate about (0, 90)
        dec, inc = pmag.dodirot(dec, inc, mean_dec, mean_inc)
        strat.append((dec, inc))
    beds = [
        (az, dip)
        for az, dip in zip(np.linspace(20, 340, n_sites), np.linspace(25, 65, n_sites))
    ]
    geo = [pmag.dotilt(d, i, az, -dip) for (d, i), (az, dip) in zip(strat, beds)]
    rows = [
        (round(gd, 1), round(gi, 1), round(sd, 1), round(si, 1))
        for (gd, gi), (sd, si) in zip(geo, strat)
    ]
    return rows, beds


def tau1_at(pmag, geo_dirs, beds, percent):
    """Largest normalised eigenvalue of the orientation matrix at `percent` untilting."""
    corrected = [
        pmag.dotilt(d, i, az, dip * percent / 100.0)
        for (d, i), (az, dip) in zip(geo_dirs, beds)
    ]
    scatter = np.zeros((3, 3))
    for d, i in corrected:
        x = pmag.dir2cart([d, i, 1.0])
        scatter += np.outer(x, x)
    eigenvalues = np.sort(np.linalg.eigvalsh(scatter))[::-1]
    return float(eigenvalues[0] / eigenvalues.sum())


def write_input(path, iteration, rows, force):
    if path.exists() and not force:
        print(f"[foldtest] {path.name} exists; use --force to overwrite")
        return
    directions = [
        {"Dgeo": gd, "Igeo": gi, "Dstrat": sd, "Istrat": si} for gd, gi, sd, si in rows
    ]
    path.write_text(json.dumps({"iteration": iteration, "directions": directions}, indent=2) + "\n")
    print(f"[foldtest] wrote {path.name}")


def gen_foldtest(args: argparse.Namespace) -> None:
    pmag = require_pmagpy()
    FIXTURE_DIR.mkdir(parents=True, exist_ok=True)
    rows, beds = build_dataset(pmag)

    write_input(FIXTURE_DIR / "synthetic_fold_saved_iteration.input.json", 0, rows, args.force)
    write_input(FIXTURE_DIR / "synthetic_fold_unsaved_iteration.input.json", 24, rows, args.force)

    # PmagPy cross-check on the rounded geographic directions + true beddings.
    geo_dirs = [(gd, gi) for gd, gi, _, _ in rows]
    curve = [{"untiltPercent": p, "tau1": round(tau1_at(pmag, geo_dirs, beds, p), 6)} for p in GRID]
    best = max(GRID, key=lambda p: tau1_at(pmag, geo_dirs, beds, p))
    cross_check = {
        "pmagpy_version": pmagpy_version(),
        "seed": SEED,
        "note": (
            "True best-unfolding optimum for this seeded dataset. PMTools' unfold locks "
            "index = -17 (see found-bugs-todo.md: findBed azimuth vs correctBedding strike)."
        ),
        "bestUntiltPercent": best,
        "tau1Curve": curve,
    }
    out_path = FIXTURE_DIR / "synthetic_fold.pmagpy.json"
    if out_path.exists() and not args.force:
        print(f"[foldtest] {out_path.name} exists; use --force to overwrite")
    else:
        out_path.write_text(json.dumps(cross_check, indent=2) + "\n")
        print(f"[foldtest] wrote {out_path.name} (PmagPy best = {best} %)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="overwrite existing fixtures")
    gen_foldtest(parser.parse_args())


if __name__ == "__main__":
    main()
