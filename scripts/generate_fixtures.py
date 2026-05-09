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
import functools
import json
import sys
from pathlib import Path
from typing import Callable

REPO_ROOT = Path(__file__).resolve().parent.parent
FIXTURES_ROOT = REPO_ROOT / "src" / "__tests__" / "fixtures"
INPUT_SUFFIX = ".input.json"
OUTPUT_SUFFIX = ".pmagpy.json"

PCA_CALC_TYPES = {"DE-BFL", "DE-BFL-A", "DE-BFP"}


class StubNotImplemented(Exception):
    """Topic is registered in the CLI but has no generator yet."""


@functools.lru_cache(maxsize=1)
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
    # PmagPy doesn't reliably set __version__ on the package, so read the
    # PyPI/installer-recorded version instead.
    try:
        from importlib.metadata import PackageNotFoundError, version
    except ImportError:
        return "unknown"
    try:
        return version("pmagpy")
    except PackageNotFoundError:
        return "unknown"


def discover_inputs(topic_dir: Path) -> list[Path]:
    if not topic_dir.is_dir():
        return []
    return sorted(topic_dir.glob(f"*{INPUT_SUFFIX}"))


def output_path_for(input_path: Path) -> Path:
    stem = input_path.name[: -len(INPUT_SUFFIX)]
    return input_path.parent / f"{stem}{OUTPUT_SUFFIX}"


def load_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as fh:
        try:
            return json.load(fh)
        except json.JSONDecodeError as exc:
            sys.exit(f"{path.relative_to(REPO_ROOT)}: invalid JSON — {exc}")


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
