"""Fisher mean fixture generator. See scripts/README.md for the input shape."""

from __future__ import annotations

import argparse

from _fixture_common import (
    FIXTURES_ROOT,
    discover_inputs,
    load_json,
    output_path_for,
    pmagpy_version,
    require_pmagpy,
    write_output,
)


def gen_fisher(args: argparse.Namespace) -> None:
    pmag = require_pmagpy()
    inputs = discover_inputs(FIXTURES_ROOT / "fisher")
    if not inputs:
        print("[fisher] no *.input.json files yet; nothing to do")
        return
    for inp in inputs:
        data = load_json(inp)
        directions = data.get("directions") or []
        if not directions:
            print(f"[fisher] {inp.name}: missing or empty 'directions'; skipping")
            continue
        # pmag.fisher_mean: input is list of [dec, inc] pairs.
        # Returns a dict with dec, inc, k, alpha95, csd, n, r.
        result = pmag.fisher_mean(directions)
        out = {
            "pmagpy_version": pmagpy_version(),
            "fisher_mean": {
                "dec": result.get("dec"),
                "inc": result.get("inc"),
                "k": result.get("k"),
                "a95": result.get("alpha95"),
                "csd": result.get("csd"),
                "n": result.get("n"),
                "r": result.get("r"),
            },
        }
        write_output(output_path_for(inp), out, args.force, "fisher")
