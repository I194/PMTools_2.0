"""Shared infrastructure for the per-topic fixture generators.

Used by `gen_*.py` siblings; not invoked directly. The leading underscore
marks this as internal helper code, not a generator topic.
"""

from __future__ import annotations

import functools
import json
import sys
from pathlib import Path

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
