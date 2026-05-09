"""PCA (principal component analysis) fixture generator.

See scripts/README.md for the input shape and the PmagPy `pmag.domean` notes.
"""

from __future__ import annotations

import argparse
import copy
import sys

from _fixture_common import (
    FIXTURES_ROOT,
    PCA_CALC_TYPES,
    discover_inputs,
    load_json,
    output_path_for,
    pmagpy_version,
    require_pmagpy,
    write_output,
)


def gen_pca(args: argparse.Namespace) -> None:
    pmag = require_pmagpy()
    inputs = discover_inputs(FIXTURES_ROOT / "pca")
    if not inputs:
        print("[pca] no *.input.json files yet; nothing to do")
        return
    bad_calc_types: list[str] = []
    for inp in inputs:
        data = load_json(inp)
        directions = data.get("directions") or []
        calc_type = data.get("calculation_type", "DE-BFL")
        if not directions:
            print(f"[pca] {inp.name}: missing or empty 'directions'; skipping")
            continue
        if calc_type not in PCA_CALC_TYPES:
            print(
                f"[pca] {inp.name}: bad calculation_type {calc_type!r} "
                f"(expected one of {sorted(PCA_CALC_TYPES)})"
            )
            bad_calc_types.append(inp.name)
            continue
        # pmag.domean expects 6-column rows: [treatment, dec, inc, intensity, ZI, quality].
        # Index 5 is the 'g'/'b' quality flag (read at pmag.py:2899). If a row
        # has fewer than 6 elements, domean appends a single 'g' (pmag.py:2895-2898),
        # so 5-col rows survive but a 4-col row crashes with IndexError on the
        # quality read. Index 4 is the Zijderveld step type ('Z'/'I'); domean
        # itself never reads it, so we leave it empty. We write the full 6-col
        # form explicitly rather than relying on the auto-pad. Treatment step is
        # synthesized as the row index because the input.json schema hides this
        # from fixture authors. start/end are 0-indexed and inclusive (pmag.py:2917,2923).
        # doprinc is NOT used: it returns no MAD and has no anchored mode.
        datablock = [
            [i, d[0], d[1], d[2], "", "g"] for i, d in enumerate(directions)
        ]
        # pmag.domean mutates rows in place (rec.append at pmag.py:2896).
        # deepcopy keeps the input pristine for any future re-use within
        # the same run.
        result = pmag.domean(copy.deepcopy(datablock), 0, len(datablock) - 1, calc_type)
        # pmag.domean returns {'specimen_direction_type': 'Error', ...} when its
        # eigendecomposition fails; everything else is missing. Don't write a
        # JSON full of nulls and pretend it's a parity oracle.
        if result.get("specimen_direction_type") == "Error":
            print(f"[pca] {inp.name}: pmag.domean returned Error; skipping")
            continue
        out = {
            "pmagpy_version": pmagpy_version(),
            "calculation_type": calc_type,
            "principal": {
                "dec": result.get("specimen_dec"),
                "inc": result.get("specimen_inc"),
                "mad": result.get("specimen_mad"),
                "dang": result.get("specimen_dang"),
                "n": result.get("specimen_n"),
                "direction_type": result.get("specimen_direction_type"),
            },
        }
        write_output(output_path_for(inp), out, args.force, "pca")

    if bad_calc_types:
        sys.exit(
            f"[pca] {len(bad_calc_types)} fixture(s) had invalid calculation_type "
            f"and were not generated: {', '.join(bad_calc_types)}. "
            f"Fix the input.json files and re-run."
        )
