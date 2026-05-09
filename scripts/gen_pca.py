"""PCA (principal component analysis) fixture generator.

See scripts/README.md for the input shape and the PmagPy `pmag.domean` notes.
"""

from __future__ import annotations

import argparse

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
                f"(expected one of {sorted(PCA_CALC_TYPES)}); skipping"
            )
            continue
        # pmag.domean(data, start, end, calculation_type):
        #   data         — list of [dec, inc, intensity] rows
        #   start/end    — indices into data (inclusive)
        #   calc type    — DE-BFL (free line), DE-BFL-A (anchored line), DE-BFP (plane)
        # Returns specimen_dec, specimen_inc, specimen_mad, specimen_n,
        # specimen_direction_type, center_of_mass, ...
        # doprinc is NOT used: it doesn't return MAD and doesn't model anchored mode.
        result = pmag.domean(directions, 0, len(directions) - 1, calc_type)
        out = {
            "pmagpy_version": pmagpy_version(),
            "calculation_type": calc_type,
            "principal": {
                "dec": result.get("specimen_dec"),
                "inc": result.get("specimen_inc"),
                "mad": result.get("specimen_mad"),
                "n": result.get("specimen_n"),
                "direction_type": result.get("specimen_direction_type"),
            },
        }
        write_output(output_path_for(inp), out, args.force, "pca")
