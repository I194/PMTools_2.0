#!/usr/bin/env python3
"""Generate PmagPy comparison fixtures for the PMTools Phase 1 test suite.

For each `<name>.input.json` under `src/__tests__/fixtures/<topic>/`, runs the
matching PmagPy routine and writes `<name>.pmagpy.json` next to it.

The Jest suite reads the committed `*.pmagpy.json` files at runtime — this
script is **only** needed when adding or refreshing a fixture. CI never runs
this script and the test suite has no Python dependency.

Per-topic generators live in sibling `gen_<topic>.py` files; this file is the
CLI entry point and dispatch table.

Run from the repo root:

    python3 scripts/generate_fixtures.py fisher
    python3 scripts/generate_fixtures.py all --force

See `scripts/README.md` for the input-file shape per topic and for the
"PmagPy disagrees with PMTools" investigation procedure.
"""

from __future__ import annotations

import argparse
import sys
from typing import Callable

from _fixture_common import StubNotImplemented, require_pmagpy
from gen_fisher import gen_fisher
from gen_pca import gen_pca


def gen_stub(name: str) -> Callable[[argparse.Namespace], None]:
    def gen(_args: argparse.Namespace) -> None:
        raise StubNotImplemented(
            f"[{name}] generator not yet implemented. "
            f"Implement when the corresponding test step lands and document "
            f"the input schema in scripts/README.md."
        )

    return gen


GENERATORS: dict[str, Callable[[argparse.Namespace], None]] = {
    "fisher": gen_fisher,
    "pca": gen_pca,
    "watson": gen_stub("watson"),
    "vgp": gen_stub("vgp"),
    "mcfadden": gen_stub("mcfadden"),
    "fold_test": gen_stub("fold_test"),
    "cutoff": gen_stub("cutoff"),
    "bootstrap": gen_stub("bootstrap"),
}


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "topic",
        choices=list(GENERATORS) + ["all"],
        help="fixture topic to (re)generate, or 'all' for every implemented topic",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="overwrite existing .pmagpy.json files",
    )
    args = parser.parse_args()

    if args.topic == "all":
        # Fail fast if PmagPy isn't installed — otherwise every implemented
        # generator would print the install message in turn.
        require_pmagpy()
        for name, fn in GENERATORS.items():
            print(f"\n=== {name} ===")
            try:
                fn(args)
            except StubNotImplemented as exc:
                print(str(exc))
        # Stubs are expected absences, not failures: exit 0.
    else:
        try:
            GENERATORS[args.topic](args)
        except StubNotImplemented as exc:
            sys.exit(str(exc))


if __name__ == "__main__":
    main()
