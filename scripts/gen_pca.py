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
        # pmag.domean wants 5+ column rows: [treatment, dec, inc, intensity, quality].
        # It indexes row[5] for the 'g'/'b' quality flag (3-column input crashes
        # with IndexError). We synthesize treatment as the row index and mark
        # every point 'g' (good) since the input.json schema deliberately hides
        # this from fixture authors — they write [dec, inc, intensity] tuples.
        # start/end are inclusive. doprinc is NOT used: no MAD, no anchored mode.
        datablock = [
            [i, d[0], d[1], d[2], "g"] for i, d in enumerate(directions)
        ]
        result = pmag.domean(datablock, 0, len(datablock) - 1, calc_type)
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
