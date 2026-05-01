#!/usr/bin/env python3
"""Generate PmagPy comparison fixtures for the PMTools Phase 1 test suite.

For each `<name>.input.json` under `src/__tests__/fixtures/<topic>/`, runs the
matching PmagPy routine and writes `<name>.pmagpy.json` next to it.

The Jest suite reads the committed `*.pmagpy.json` files at runtime — this
script is **only** needed when adding or refreshing a fixture. CI never runs
this script and the test suite has no Python dependency.

Run from the repo root:

    python3 scripts/generate_fixtures.py fisher
    python3 scripts/generate_fixtures.py all --force

See `scripts/README.md` for the input-file shape per topic and for the
"PmagPy disagrees with PMTools" investigation procedure.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Callable

REPO_ROOT = Path(__file__).resolve().parent.parent
FIXTURES_ROOT = REPO_ROOT / "src" / "__tests__" / "fixtures"
INPUT_SUFFIX = ".input.json"
OUTPUT_SUFFIX = ".pmagpy.json"


def require_pmagpy():
    try:
        from pmagpy import pmag  # type: ignore[import-not-found]
    except ImportError:
        sys.exit(
            "PmagPy is not installed.\n"
            "Run:  pip install pmagpy\n"
            "Then re-run this script."
        )
    return pmag


def pmagpy_version() -> str:
    try:
        import pmagpy  # type: ignore[import-not-found]

        return getattr(pmagpy, "__version__", "unknown")
    except ImportError:
        return "unknown"


def discover_inputs(topic_dir: Path) -> list[Path]:
    if not topic_dir.is_dir():
        return []
    return sorted(topic_dir.glob(f"*{INPUT_SUFFIX}"))


def output_path_for(input_path: Path) -> Path:
    stem = input_path.name[: -len(INPUT_SUFFIX)]
    return input_path.parent / f"{stem}{OUTPUT_SUFFIX}"


def write_output(output_path: Path, data: dict, force: bool, label: str) -> bool:
    if output_path.exists() and not force:
        rel = output_path.relative_to(REPO_ROOT)
        print(f"[{label}] skip {rel} (exists; pass --force to overwrite)")
        return False
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
        fh.write("\n")
    print(f"[{label}] wrote {output_path.relative_to(REPO_ROOT)}")
    return True


def gen_fisher(args: argparse.Namespace) -> None:
    pmag = require_pmagpy()
    inputs = discover_inputs(FIXTURES_ROOT / "fisher")
    if not inputs:
        print("[fisher] no *.input.json files yet; nothing to do")
        return
    for inp in inputs:
        with open(inp, encoding="utf-8") as fh:
            data = json.load(fh)
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
                "dec": result["dec"],
                "inc": result["inc"],
                "k": result["k"],
                "a95": result["alpha95"],
                "csd": result.get("csd"),
                "n": result["n"],
                "r": result["r"],
            },
        }
        write_output(output_path_for(inp), out, args.force, "fisher")


def gen_pca(args: argparse.Namespace) -> None:
    pmag = require_pmagpy()
    inputs = discover_inputs(FIXTURES_ROOT / "pca")
    if not inputs:
        print("[pca] no *.input.json files yet; nothing to do")
        return
    for inp in inputs:
        with open(inp, encoding="utf-8") as fh:
            data = json.load(fh)
        vectors = data.get("vectors") or []
        anchored = bool(data.get("anchored", False))
        if not vectors:
            print(f"[pca] {inp.name}: missing or empty 'vectors'; skipping")
            continue
        # pmag.doprinc: PCA on a block of [x, y, z] vectors.
        result = pmag.doprinc(vectors)
        out = {
            "pmagpy_version": pmagpy_version(),
            "anchored": anchored,
            "principal": {
                "dec": result.get("dec"),
                "inc": result.get("inc"),
                "tau1": result.get("tau1"),
                "tau2": result.get("tau2"),
                "tau3": result.get("tau3"),
                "MAD": result.get("MAD"),
                "N": result.get("N"),
            },
        }
        write_output(output_path_for(inp), out, args.force, "pca")


def gen_stub(name: str) -> Callable[[argparse.Namespace], None]:
    def gen(_args: argparse.Namespace) -> None:
        sys.exit(
            f"[{name}] generator not yet implemented. "
            f"Implement it when the corresponding test step lands and document "
            f"the input schema in scripts/README.md."
        )

    return gen


GENERATORS: dict[str, Callable[[argparse.Namespace], None]] = {
    "fisher": gen_fisher,
    "pca": gen_pca,
    "watson": gen_stub("watson"),
    "vgp": gen_stub("vgp"),
    "mcfadden": gen_stub("mcfadden"),
    "fold-test": gen_stub("fold-test"),
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
        any_failed = False
        for name, fn in GENERATORS.items():
            print(f"\n=== {name} ===")
            try:
                fn(args)
            except SystemExit as exc:
                # stubs raise SystemExit by design — keep going for the rest
                code = exc.code
                if code not in (None, 0):
                    print(str(code) if isinstance(code, str) else f"exit code {code}")
                    any_failed = True
        if any_failed:
            sys.exit(1)
    else:
        GENERATORS[args.topic](args)


if __name__ == "__main__":
    main()
