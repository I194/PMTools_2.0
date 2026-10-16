#!/usr/bin/env python3
"""PB-06 oracle: inclination-only mean (McFadden & Reid 1982) against pmag.doincfish.

calculateMCFaddenIncMean is dead code (no production importer, SCI-20 approves deleting it);
this row still records its parity with PmagPy so a later revival or deletion is informed.

Writes src/__tests__/fixtures/part_b/pb06_inclination_only_mean.pmagpy.json with the
inclination sets (real files, Part A inputs, seeded Fisher synthetic sets, edge cases),
each with the pmag.doincfish result.

PMTools's root search has no iteration cap and never ends on exact-root or no-root inputs
(e.g. [90, 90, 90], [30, 30, 30], [88, 89, 90, 87]); such sets are left out of the fixture,
detected here with a capped copy of that walk. PmagPy itself raises IndexError on no-root
inputs (pmag.py "No zeros found" fallback), so those are left out as well.

Run:  python3 scripts/oracle_pb06_inclination_only_mean.py
then: npx prettier --write src/__tests__/fixtures/part_b/pb06_inclination_only_mean.pmagpy.json
"""

from __future__ import annotations

import contextlib
import io
import json
import math

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb06_inclination_only_mean.pmagpy.json"
WALK_ITERATION_CAP = 20000

DOCSTRING_EXAMPLE = [62.4, 61.6, 50.2, 65.2, 53.2, 61.4, 74.0, 60.0, 52.6, 71.8]


def pmtools_walk_terminates(inclinations: list[float]) -> bool:
    """Capped copy of the walk in calculateMCFaddenIncMean.ts:68-84 (termination check only)."""
    absolute = [abs(value) for value in inclinations]
    count = len(absolute)
    if count < 2:
        return True
    gaussian_mean = sum(value / count for value in absolute)
    if gaussian_mean < 30:
        return True
    rad = math.pi / 180
    sum_cos = sum(math.cos((90 - value) * rad) for value in absolute)
    sum_sin = sum(math.sin((90 - value) * rad) for value in absolute)

    def misfit(colatitude: float) -> float:
        value = count * math.cos(colatitude)
        value += (math.sin(colatitude) ** 2 - math.cos(colatitude) ** 2) * sum_cos
        value -= 2 * math.sin(colatitude) * math.cos(colatitude) * sum_sin
        return value

    colatitude = (90 - gaussian_mean) * rad
    epsilon = misfit(colatitude)
    direction = gaussian_mean
    for _ in range(WALK_ITERATION_CAP):
        if direction > 0:
            colatitude -= 0.01 * rad
        if direction < 0:
            colatitude += 0.01 * rad
        previous = epsilon
        epsilon = misfit(colatitude)
        if abs(epsilon) > abs(previous):
            direction = -direction
        if epsilon * previous < 0:
            return True
    return False


def to_json_number(value):
    value = float(value)
    return value if math.isfinite(value) else None


def run_doincfish(pmag, inclinations: list[float]) -> dict:
    stdout = io.StringIO()
    with contextlib.redirect_stdout(stdout), np.errstate(divide="ignore", invalid="ignore"):
        result = pmag.doincfish(inclinations)
    count = len(inclinations)
    output = {
        "n": int(result["n"]),
        "ginc": to_json_number(result["ginc"]),
        "inc": to_json_number(result["inc"]),
        "r": to_json_number(result["r"]),
        "k": to_json_number(result["k"]),
        # The shallow (Gaussian) branch returns no alpha95 key at all.
        "alpha95": to_json_number(result["alpha95"]) if "alpha95" in result else None,
        "csd": to_json_number(result["csd"]),
        "fTerm": to_json_number(pmag.fcalc(2, count - 1)) if count > 1 else None,
        "stdout": stdout.getvalue().strip(),
    }
    if "alpha95" in result and result["k"] != 0 and math.isfinite(result["k"]):
        # a95 at PmagPy's root with the F-term removed: what PMTools computes (f = 0).
        colatitudes = np.deg2rad(90.0 - np.abs(np.array(inclinations, dtype=float)))
        root = np.deg2rad(90.0 - float(result["inc"]))
        cosine_sum = np.cos(root - colatitudes).sum()
        sine_sum = np.sin(root - colatitudes).sum()
        output["alpha95WithoutFTerm"] = float(np.rad2deg(np.arccos(1.0 - 0.5 * (sine_sum / cosine_sum) ** 2)))
    return output


def fisher_inclinations(rng, count: int, mean_inclination: float, kappa: float) -> list[float]:
    """Inclinations of Fisher-distributed unit vectors about (D = 0, I = mean_inclination)."""
    uniform = rng.uniform(size=count)
    cos_theta = 1 + np.log(1 - uniform * (1 - np.exp(-2 * kappa))) / kappa
    sin_theta = np.sqrt(np.clip(1 - cos_theta**2, 0, None))
    phi = rng.uniform(0, 2 * np.pi, size=count)
    # Pole frame: z along the mean direction; rotate it from vertical down to the mean inclination.
    x, z = sin_theta * np.cos(phi), cos_theta
    tilt = np.deg2rad(90 - mean_inclination)
    down = -x * np.sin(tilt) + z * np.cos(tilt)
    return np.rad2deg(np.arcsin(np.clip(down, -1, 1))).tolist()


def synthetic_sets(rng):
    sets = []
    for mean_inclination in [35, 45, 55, 65, 75]:
        for kappa in [10, 30, 100]:
            for count in [3, 5, 10, 25, 60]:
                inclinations = fisher_inclinations(rng, count, mean_inclination, kappa)
                sets.append((f"fisher I={mean_inclination} k={kappa} N={count}", inclinations))
    for index in range(6):
        inclinations = fisher_inclinations(rng, 20, float(rng.uniform(35, 70)), 40)
        signs = rng.choice([-1, 1], size=len(inclinations))
        sets.append((f"mixed polarity {index}", (np.array(inclinations) * signs).tolist()))
    for index in range(6):
        inclinations = fisher_inclinations(rng, 15, float(rng.uniform(40, 70)), 25)
        sets.append((f"rounded to 0.1 deg {index}", [round(value, 1) for value in inclinations]))
    return sets


def real_file_sets():
    sample_lines = [line for line in (REPO_ROOT / "test-data/sample.dir").read_text().splitlines() if len(line) > 1]
    sample_geographic = [float(line[33:39]) for line in sample_lines]
    sample_stratigraphic = [float(line[45:51]) for line in sample_lines]

    pmm_lines = [line for line in (REPO_ROOT / "src/assets/examples/exampleDIR.pmm").read_text().splitlines()[1:]]
    pmm_rows = [line.replace(" ", "").split(",") for line in pmm_lines if len(line) > 1][2:]
    pmm_geographic = [float(row[5]) for row in pmm_rows]
    # The .pmm Istrat column repeats Igeo row for row, so only Igeo is used.
    return [
        {"name": "test-data/sample.dir Igeo", "file": "test-data/sample.dir", "column": "Igeo", "inclinations": sample_geographic},
        {"name": "test-data/sample.dir Istrat", "file": "test-data/sample.dir", "column": "Istrat", "inclinations": sample_stratigraphic},
        {"name": "exampleDIR.pmm Igeo", "file": "src/assets/examples/exampleDIR.pmm", "column": "Igeo", "inclinations": pmm_geographic},
        {
            "name": "exampleDIR.pmm Igeo with |I| >= 30",
            "file": "src/assets/examples/exampleDIR.pmm",
            "column": "Igeo",
            "minimumAbsoluteInclination": 30,
            "inclinations": [value for value in pmm_geographic if abs(value) >= 30],
        },
    ]


def main() -> None:
    pmag = require_pmagpy()
    rng = np.random.default_rng(SEED)

    named_sets = [
        ("pmag.doincfish docstring example", DOCSTRING_EXAMPLE),
        ("Part A steep_inclinations", [52, 58, 44, 49, 63, 50]),
        ("Part A shallow_inclinations", [12, 18, 25, 9, 15, 21]),
        ("all-negative copy of Part A steep", [-52, -58, -44, -49, -63, -50]),
        ("N=2 distinct", [55, 65]),
        ("mean exactly 30 with spread", [25, 35]),
        ("mean just below 30", [29.99, 29.99]),
        *synthetic_sets(rng),
    ]
    cases, excluded = [], []
    for name, inclinations in named_sets:
        if not pmtools_walk_terminates(inclinations):
            excluded.append({"name": name, "reason": "PMTools walk does not terminate"})
            continue
        try:
            result = run_doincfish(pmag, inclinations)
        except IndexError:
            excluded.append({"name": name, "reason": "pmag.doincfish raises IndexError (no misfit root)"})
            continue
        cases.append({"name": name, "inclinations": inclinations, "pmagpy": result})

    real_files = []
    for real_file in real_file_sets():
        if not pmtools_walk_terminates(real_file["inclinations"]):
            excluded.append({"name": real_file["name"], "reason": "PMTools walk does not terminate"})
            continue
        real_files.append({**real_file, "pmagpy": run_doincfish(pmag, real_file["inclinations"])})

    # PMTools throws at N=1 (SCI-08) and steps off the exact root at zero scatter: recorded, never looped.
    single_and_degenerate = [
        {"name": "N=1 steep", "inclinations": [60], "pmagpy": run_doincfish(pmag, [60])},
        {"name": "N=1 shallow", "inclinations": [20], "pmagpy": run_doincfish(pmag, [20])},
        {"name": "N=2 zero scatter", "inclinations": [60, 60], "pmagpy": run_doincfish(pmag, [60, 60])},
    ]

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": "pmag.doincfish(inclinations); alpha95WithoutFTerm = acos(1 - 0.5 (S/C)^2) at PmagPy's root",
        "seed": SEED,
        "cases": cases,
        "realFiles": real_files,
        "singleAndDegenerate": single_and_degenerate,
        "excluded": excluded,
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2) + "\n")
    print(f"[pb06] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}: {len(cases)} cases, {len(real_files)} real files, {len(excluded)} excluded")
    for item in excluded:
        print(f"[pb06] excluded {item['name']}: {item['reason']}")


if __name__ == "__main__":
    main()
