#!/usr/bin/env python3
"""PB-12 oracle: Watson (1956) conglomerate (randomness) test against ipmag.conglomerate_test_Watson.

Writes src/__tests__/fixtures/part_b/pb12_conglomerate_test.pmagpy.json. For every direction set
the oracle records n and R from pmag.fisher_mean, then Ro_95, Ro_99 and the printed verdict lines
of ipmag.conglomerate_test_Watson(R, n). Direction sets:
  - real .dir / .pmm files (Dgeo, Igeo as the live parsers read them);
  - seeded uniform-on-sphere and Fisher-clustered sets for N = 0..40, 100, 224;
  - "fan" sets (I = 0, symmetric declinations) built so R sits just below Ro_95, between the
    two levels, and just above Ro_99, for every N = 5..40, 100, 224;
  - sets whose float R equals Ro_95 or Ro_99 exactly (checks the strict < / > comparisons).
It also records the exact 95% / 99% quantiles of R for N uniform directions (Stephens 1964 form of
the Rayleigh random-walk distribution), an independent check of Watson's tabulated Ro values.

Run:  python3 scripts/oracle_pb12_conglomerate_test.py
(prettier ignores src/__tests__/fixtures/, so the script writes number arrays on one line itself.)
"""

from __future__ import annotations

import contextlib
import io
import json
import math
import re
import struct
from fractions import Fraction

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb12_conglomerate_test.pmagpy.json"
DIR_FILES = ["test-data/sample.dir", "test-data/field_batch.dir"]
PMM_FILES = [
    "src/assets/examples/exampleDIR.pmm",
    "test-data/season1_north.pmm",
    "test-data/season1_south.pmm",
    "test-data/season2_extra.pmm",
]
SWEEP_SIZES = list(range(0, 41)) + [100, 224]
FAN_SIZES = list(range(5, 41)) + [100, 224]
CLUSTER_KAPPAS = [0.5, 1, 2, 5, 30]
# Synthetic inputs are stored with 4 decimals so the fixture stays small; both sides read the same values.
DECIMALS = 4
FAN_MARGIN = 0.01
# The verdict lines ipmag.conglomerate_test_Watson prints; the fixture stores indices into this list.
VERDICT_TEXTS = [
    'This population "passes" a conglomerate test as the null hypothesis of randomness cannot be rejected at the 95% confidence level',
    "The null hypothesis of randomness can be rejected at the 95% confidence level",
    "The null hypothesis of randomness can be rejected at the 99% confidence level",
]


def ipmag_module():
    require_pmagpy()
    from pmagpy import ipmag  # type: ignore[import-not-found]

    return ipmag


def run_oracle(pmag, ipmag, declinations, inclinations):
    n = len(declinations)
    if n >= 2:
        resultant_length = float(pmag.fisher_mean(list(zip(declinations, inclinations)))["r"])
    else:
        # pmag.fisher_mean returns no "r" below two directions; ipmag returns before reading R when n < 5.
        resultant_length = float(n)
    printed = io.StringIO()
    with contextlib.redirect_stdout(printed):
        result = ipmag.conglomerate_test_Watson(resultant_length, n)
    if result is None:
        return {"n": n, "result": None}
    verdict_lines = [
        VERDICT_TEXTS.index(line)
        for line in printed.getvalue().splitlines()
        if not line.startswith(("R = ", "Ro_95 = ", "Ro_99 = "))
    ]
    return {
        "n": int(result["n"]),
        "result": {
            "R": float(result["R"]),
            "Ro_95": float(result["Ro_95"]),
            "Ro_99": float(result["Ro_99"]),
            "verdictLines": verdict_lines,
        },
    }


def direction_set(pmag, ipmag, name, declinations, inclinations):
    return {
        "name": name,
        "declinations": declinations,
        "inclinations": inclinations,
        "pmagpy": run_oracle(pmag, ipmag, declinations, inclinations),
    }


def uniform_directions(rng, size):
    declinations = rng.uniform(0, 360, size)
    inclinations = np.degrees(np.arcsin(rng.uniform(-1, 1, size)))
    return declinations, inclinations


def fisher_directions(pmag, rng, size, kappa):
    # Fisher (1953) deviates about the pole, then rotated to a random mean with pmag.dodirot.
    colatitudes = np.degrees(np.arccos(1 + np.log(1 - rng.uniform(0, 1, size) * (1 - np.exp(-2 * kappa))) / kappa))
    longitudes = rng.uniform(0, 360, size)
    mean_declination, mean_inclination = uniform_directions(rng, 1)
    rotated = [
        pmag.dodirot(longitude, 90 - colatitude, mean_declination[0], mean_inclination[0])
        for longitude, colatitude in zip(longitudes, colatitudes)
    ]
    return np.array([direction[0] for direction in rotated]), np.array([direction[1] for direction in rotated])


def rounded(values):
    return [round(float(value), DECIMALS) for value in values]


def synthetic_sets(pmag, ipmag):
    rng = np.random.default_rng(SEED)
    sets = []
    for size in SWEEP_SIZES:
        declinations, inclinations = uniform_directions(rng, size)
        sets.append(direction_set(pmag, ipmag, f"uniform N={size}", rounded(declinations), rounded(inclinations)))
    for index, size in enumerate(SWEEP_SIZES):
        if size == 0:
            continue
        kappa = CLUSTER_KAPPAS[index % len(CLUSTER_KAPPAS)]
        declinations, inclinations = fisher_directions(pmag, rng, size, kappa)
        sets.append(
            direction_set(pmag, ipmag, f"fisher k={kappa} N={size}", rounded(declinations), rounded(inclinations))
        )
    return sets


def fan_declinations(size, fan_declination):
    """One direction at D = 0 when size is odd, then (size // 2) pairs at +-fan_declination; all I = 0."""
    return [0.0] * (size % 2) + [fan_declination, -fan_declination] * (size // 2)


def critical_values(ipmag, size):
    """(Ro_95, Ro_99) exactly as ipmag.conglomerate_test_Watson computes them."""
    with contextlib.redirect_stdout(io.StringIO()):
        result = ipmag.conglomerate_test_Watson(0.0, size)
    return float(result["Ro_95"]), float(result["Ro_99"])


def fan_sets(pmag, ipmag):
    sets = []
    for size in FAN_SIZES:
        ro_95, ro_99 = critical_values(ipmag, size)
        targets = {
            "below Ro_95": ro_95 - FAN_MARGIN,
            "between Ro_95 and Ro_99": (ro_95 + ro_99) / 2,
            "above Ro_99": ro_99 + FAN_MARGIN,
        }
        for label, target in targets.items():
            odd_offset = size % 2
            cosine = (target - odd_offset) / (size - odd_offset)
            fan_declination = round(math.degrees(math.acos(cosine)), 10)
            declinations = fan_declinations(size, fan_declination)
            entry = direction_set(pmag, ipmag, f"fan N={size} {label}", declinations, [0.0] * size)
            entry["fanDeclination"] = fan_declination
            del entry["declinations"], entry["inclinations"]
            sets.append(entry)
    return sets


def next_float(value, steps):
    (bits,) = struct.unpack("<q", struct.pack("<d", value))
    return struct.unpack("<d", struct.pack("<q", bits + steps))[0]


def exact_threshold_declinations(size, ones, target):
    """+-theta, then `ones` at D = 0, then antipodal pairs (D = 180 / 0): R = 2 cos(theta) + ones = target.

    Both sides sum the unit vectors in this order; the antipodal pairs leave the x sum unchanged exactly.
    """
    pairs = (size - ones - 2) // 2
    first_guess = math.degrees(math.acos((target - ones) / 2))
    for steps in sorted(range(-2000, 2001), key=abs):
        candidate = next_float(first_guess, steps)
        # Emulates PMTools' dec / (180 / pi); the caller then checks PmagPy's own R hits the target too.
        cosine_pmtools = math.cos(candidate / (180 / math.pi))
        x_sum = cosine_pmtools + cosine_pmtools
        for _ in range(ones):
            x_sum += 1.0
        if x_sum == target:
            yield [candidate, -candidate] + [0.0] * ones + [180.0, 0.0] * pairs


def exact_threshold_sets(pmag, ipmag):
    sets = []
    for size, level in [(5, "95"), (5, "99"), (20, "95"), (20, "99"), (21, "95"), (21, "99"), (40, "95")]:
        target = critical_values(ipmag, size)[0 if level == "95" else 1]
        ones = math.floor(target)
        if (size - ones) % 2 == 1:
            ones -= 1
        for declinations in exact_threshold_declinations(size, ones, target):
            entry = direction_set(pmag, ipmag, f"R == Ro_{level} N={size}", declinations, [0.0] * size)
            if entry["pmagpy"]["result"]["R"] == target:
                entry["exactTarget"] = target
                sets.append(entry)
                break
        else:
            raise SystemExit(f"no declination gives R == Ro_{level} exactly for N={size}")
    return sets


def read_dir_file(relative_path):
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines() if len(line) > 1]
    return [float(line[27:33]) for line in lines], [float(line[33:39]) for line in lines]


def read_pmm_file(relative_path):
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:] if len(line) > 1][2:]
    params = [line.replace(" ", "").split(",") for line in lines]
    return [float(row[4]) for row in params], [float(row[5]) for row in params]


def real_file_sets(pmag, ipmag):
    sets = []
    for relative_path in DIR_FILES:
        sets.append({"format": "dir", **direction_set(pmag, ipmag, relative_path, *read_dir_file(relative_path))})
    for relative_path in PMM_FILES:
        sets.append({"format": "pmm", **direction_set(pmag, ipmag, relative_path, *read_pmm_file(relative_path))})
    return sets


def uniform_resultant_cdf(resultant_length: Fraction, size: int) -> Fraction:
    """P(|sum of `size` uniform unit vectors| <= R), exact rational arithmetic (alternating sum cancels badly)."""
    power = size - 2
    total = Fraction(0)
    for k in range(size + 1):
        a = size - 2 * k
        if a <= 0:
            continue
        upper = min(resultant_length, Fraction(a))

        def antiderivative(r):
            return -((a - r) ** (power + 1)) * r / (power + 1) - ((a - r) ** (power + 2)) / ((power + 1) * (power + 2))

        total += (-1) ** k * math.comb(size, k) * (antiderivative(upper) - antiderivative(Fraction(0)))
    return total / (2 ** (size - 1) * math.factorial(power))


def uniform_resultant_quantile(size: int, probability: float) -> float:
    low, high = Fraction(0), Fraction(size)
    for _ in range(40):
        middle = (low + high) / 2
        if uniform_resultant_cdf(middle, size) < Fraction(probability):
            low = middle
        else:
            high = middle
    return round(float((low + high) / 2), 6)


def exact_quantiles():
    return [
        {
            "n": size,
            "quantile95": uniform_resultant_quantile(size, 0.95),
            "quantile99": uniform_resultant_quantile(size, 0.99),
        }
        for size in range(5, 31)
    ]


def main() -> None:
    pmag = require_pmagpy()
    ipmag = ipmag_module()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": "n, R from pmag.fisher_mean(Dgeo, Igeo); Ro_95, Ro_99, printed verdicts from ipmag.conglomerate_test_Watson(R, n)",
        "seed": SEED,
        "verdictTexts": VERDICT_TEXTS,
        "realFiles": real_file_sets(pmag, ipmag),
        "synthetic": synthetic_sets(pmag, ipmag),
        "fan": fan_sets(pmag, ipmag),
        "exactThreshold": exact_threshold_sets(pmag, ipmag),
        "uniformResultantQuantiles": exact_quantiles(),
    }
    # One line per number array keeps the fixture small (prettier skips src/__tests__/fixtures/).
    text = re.sub(
        r"\[\s+(-?[\d.e+-]+(?:,\s+-?[\d.e+-]+)*)\s+\]",
        lambda match: "[" + re.sub(r",\s+", ", ", match.group(1)) + "]",
        json.dumps(fixture, indent=2),
    )
    OUTPUT_PATH.write_text(text + "\n")
    print(f"[pb12] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
