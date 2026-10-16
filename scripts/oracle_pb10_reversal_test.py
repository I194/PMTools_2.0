#!/usr/bin/env python3
"""PB-10 oracle: reversal tests (classic, bootstrap, manual) against PmagPy.

Writes src/__tests__/fixtures/part_b/pb10_reversal_test.pmagpy.json with
  - classic: real .dir/.pmm files and seeded dual-polarity sets. Per case: the pmag.flip split,
    pmag.fisher_mean of both groups, gamma = pmag.angle of the two means, the critical angle from
    McFadden & McElhinny (1990, Geophys. J. Int. 103, 725-729) eq. (15) re-implemented below, and
    for some cases ipmag.reversal_test_MM1990 (Watson V Monte Carlo) over several seeds;
  - splitDifferences: sets where the PMTools split (principal axis of the CENTRED vectors, emulated
    here) differs from pmag.flip (principal axis of the uncentred orientation matrix);
  - manual: two typed means with N and k (R = N - (N - 1) / k), same eq. (15), raw angle;
  - bootstrap: 2.5 / 97.5 % bounds of the x, y, z bootstrap means (pmag.di_boot, the core of
    ipmag.common_mean_bootstrap) with the spread of each bound over independent 1000-sample runs,
    and for groups of at most six directions the exact set of values each bound can take.

Run:  python3 scripts/oracle_pb10_reversal_test.py   (about 6 minutes: Monte Carlo runs)
then: npx prettier --write src/__tests__/fixtures/part_b/pb10_reversal_test.pmagpy.json
"""

from __future__ import annotations

import contextlib
import inspect
import io
import itertools
import json
import math
import os

import numpy as np

from _fixture_common import FIXTURES_ROOT, REPO_ROOT, pmagpy_version, require_pmagpy

os.environ.setdefault("MPLBACKEND", "Agg")

SEED = 20261016
OUTPUT_PATH = FIXTURES_ROOT / "part_b" / "pb10_reversal_test.pmagpy.json"
PROBABILITY = 0.05
MONTE_CARLO_SEEDS = list(range(10))
BOOTSTRAP_SIMULATIONS = 1000  # what the PMTools UI runs
BOOTSTRAP_REFERENCE_SIMULATIONS = 5000  # pmag.di_boot default, used by ipmag.common_mean_bootstrap
BOOTSTRAP_SPREAD_RUNS = 100
EXACT_BOOTSTRAP_MAX_GROUP = 6  # enumerate every resample when a group is this small
ATOM_PROBABILITY_FLOOR = 1e-12


def critical_angle_eq15(n1, r1, n2, r2):
    """McFadden & McElhinny (1990) eq. (15), common-precision closed form at p = 0.05:
    cos(gamma_c) = 1 - (N - R1 - R2)(R1 + R2) / (R1 R2) * ((1 / p)^(1 / (N - 2)) - 1), N = N1 + N2."""
    total = n1 + n2
    cosine = 1 - ((total - r1 - r2) * (r1 + r2) / (r1 * r2)) * ((1 / PROBABILITY) ** (1 / (total - 2)) - 1)
    return math.degrees(math.acos(cosine)) if -1 <= cosine <= 1 else None


def ipmag_classification(critical_angle, positive):
    """The thresholds of ipmag.common_mean_watson (strict <), applied to a given critical angle."""
    if not positive:
        return ""
    if critical_angle < 5:
        return "A"
    if critical_angle < 10:
        return "B"
    if critical_angle < 20:
        return "C"
    return "indeterminate"


def assert_ipmag_thresholds_unchanged(ipmag):
    source = inspect.getsource(ipmag.common_mean_watson)
    for threshold in ["critical_angle < 5", "critical_angle < 10", "critical_angle < 20", "'indeterminate'"]:
        assert threshold in source, f"ipmag.common_mean_watson no longer contains {threshold!r}"


def parse_dir_geographic(relative_path):
    """Dgeo / Igeo columns of parserDIR.ts (sample.dir has no 'rep G' rows)."""
    rows = []
    for line in (REPO_ROOT / relative_path).read_text().splitlines():
        if len(line) > 1:
            rows.append([float(line[27:33]), float(line[33:39])])
    return rows


def parse_pmm_geographic(relative_path):
    """Dgeo / Igeo fields of parserPMM.ts: drop the first line and the header, strip whitespace."""
    lines = [line for line in (REPO_ROOT / relative_path).read_text().splitlines()[1:] if len(line) > 1]
    return [[float(fields[4]), float(fields[5])] for fields in ("".join(line.split()).split(",") for line in lines[2:])]


def fisher_set(pmag, rng, kappa, count, declination, inclination):
    """Seeded Fisher draws, the same steps as ipmag.fishrot."""
    declinations, inclinations = pmag.fshdev(np.repeat(kappa, count), random_seed=rng)
    rotated = pmag.dodirot_V(np.vstack([declinations, inclinations]).T, np.repeat(declination, count),
                             np.repeat(inclination, count))
    return [[float(row[0]), float(row[1])] for row in rotated]


def pmagpy_split(pmag, directions):
    normal, reversed_flipped = pmag.flip(directions)
    principal = pmag.doprinc(directions)
    reversed_indices = [
        index for index, direction in enumerate(directions)
        if pmag.angle(direction, [principal["dec"], principal["inc"]])[0] > 90
    ]
    assert len(reversed_indices) == len(reversed_flipped) and len(normal) + len(reversed_flipped) == len(directions)
    return normal, reversed_flipped, reversed_indices


def centred_split_reversed_indices(pmag, directions):
    """Emulation of splitPolarities (eigManipulations.ts): principal axis of the centred vectors."""
    vectors = np.array(pmag.dir2cart(directions))
    centred = vectors - vectors.mean(axis=0)
    eigenvalues, eigenvectors = np.linalg.eigh(centred.T @ centred / len(centred))
    axis_declination, axis_inclination = pmag.doflip(*pmag.cart2dir(eigenvectors[:, np.argmax(eigenvalues)])[:2])
    return [
        index for index, direction in enumerate(directions)
        if pmag.angle(direction, [axis_declination, axis_inclination])[0] > 90
    ]


def fisher_summary(pmag, directions):
    mean = pmag.fisher_mean(directions)
    return {"dec": float(mean["dec"]), "inc": float(mean["inc"]), "n": int(mean["n"]), "r": float(mean["r"]),
            "k": float(mean["k"])}


def monte_carlo(ipmag, directions):
    critical_angles, first_run = [], None
    for seed in MONTE_CARLO_SEEDS:
        with contextlib.redirect_stdout(io.StringIO()):
            result, angle, critical_angle, classification = ipmag.reversal_test_MM1990(
                di_block=directions, random_seed=seed)
        critical_angles.append(float(critical_angle))
        if first_run is None:
            first_run = {"seed": seed, "result": int(result), "angle": float(angle),
                         "criticalAngle": float(critical_angle), "classification": classification}
    return {
        "seeds": MONTE_CARLO_SEEDS,
        "criticalAngles": critical_angles,
        "mean": float(np.mean(critical_angles)),
        "standardDeviation": float(np.std(critical_angles, ddof=1)),
        "firstRun": first_run,
    }


def classic_case(pmag, ipmag, name, directions=None, source=None, with_monte_carlo=False, note=None):
    if directions is None:
        reader = parse_dir_geographic if source.endswith(".dir") else parse_pmm_geographic
        directions = reader(source)
    normal, reversed_flipped, reversed_indices = pmagpy_split(pmag, directions)
    assert centred_split_reversed_indices(pmag, directions) == reversed_indices, f"{name}: splits differ"
    normal_mean = fisher_summary(pmag, normal)
    reversed_mean = fisher_summary(pmag, reversed_flipped)
    gamma = float(pmag.angle([normal_mean["dec"], normal_mean["inc"]], [reversed_mean["dec"], reversed_mean["inc"]])[0])
    critical = critical_angle_eq15(normal_mean["n"], normal_mean["r"], reversed_mean["n"], reversed_mean["r"])
    case = {"name": name}
    if note:
        case["note"] = note
    if source:
        case["source"] = source
    else:
        case["directions"] = directions
    case["pmagpy"] = {
        "reversedIndices": reversed_indices,
        "normalMean": normal_mean,
        "reversedMean": reversed_mean,
        "gamma": gamma,
        "gammaCriticalEq15": critical,
        "ipmagClassification": ipmag_classification(critical, gamma <= critical),
    }
    if with_monte_carlo:
        case["monteCarlo"] = monte_carlo(ipmag, directions)
    return case


def classic_cases(pmag, ipmag):
    rng = np.random.default_rng(SEED)

    def draw(kappa, count, declination, inclination):
        return fisher_set(pmag, rng, kappa, count, declination, inclination)

    return [
        classic_case(pmag, ipmag, "test-data/sample.dir", source="test-data/sample.dir", with_monte_carlo=True),
        classic_case(pmag, ipmag, "src/assets/examples/exampleDIR.pmm", source="src/assets/examples/exampleDIR.pmm",
                     with_monte_carlo=True),
        classic_case(pmag, ipmag, "antipodal, k 20 both, 15 N + 10 R",
                     draw(20, 15, 10, 50) + draw(20, 10, 190, -50), with_monte_carlo=True),
        classic_case(pmag, ipmag, "antipodal, k 60 both, 20 N + 20 R (class A or B)",
                     draw(60, 20, 350, 60) + draw(60, 20, 170, -60), with_monte_carlo=True),
        classic_case(pmag, ipmag, "reversed mean 25 degrees off the antipode, k 20 both, 15 N + 12 R",
                     draw(20, 15, 10, 50) + draw(20, 12, 215, -40), with_monte_carlo=True),
        classic_case(pmag, ipmag, "antipodal, unequal precision k 8 (N) vs k 80 (R), 25 N + 25 R",
                     draw(8, 25, 30, 40) + draw(80, 25, 210, -40), with_monte_carlo=True,
                     note="eq. (15) assumes a common precision; the Monte Carlo uses each group's own k"),
        classic_case(pmag, ipmag, "unbalanced, k 30, 20 N + 3 R", draw(30, 20, 340, 45) + draw(30, 3, 160, -45)),
        classic_case(pmag, ipmag, "declination wrap, k 25, 10 N + 10 R",
                     draw(25, 10, 359, 30) + draw(25, 10, 179, -30)),
        classic_case(pmag, ipmag, "steep, k 40, 12 N + 9 R", draw(40, 12, 120, 82) + draw(40, 9, 300, -82)),
        classic_case(pmag, ipmag, "dispersed, k 6, 12 N + 12 R (critical angle above 20)",
                     draw(6, 12, 20, 45) + draw(6, 12, 200, -45)),
        classic_case(pmag, ipmag, "minimal, 3 N + 2 R", [[5.0, 40.0], [12.0, 44.0], [8.0, 37.0],
                                                         [191.0, -43.0], [183.0, -39.0]]),
        classic_case(pmag, ipmag, "reversed mean 15 degrees off the antipode, k 50 both, 20 N + 20 R (negative)",
                     draw(50, 20, 10, 50) + draw(50, 20, 205, -45)),
    ]


def split_differences(pmag):
    """Sets where the centred and uncentred principal axes split the directions differently."""
    rng = np.random.default_rng(SEED + 1)
    single_polarity = fisher_set(pmag, rng, 20, 30, 10, 50)

    # 30 N + 1 R at k 10: report how often the split differs, keep the first draw where it does.
    differing, first_differing = 0, None
    draws = 50
    for _ in range(draws):
        directions = fisher_set(pmag, rng, 10, 30, 10, 50) + fisher_set(pmag, rng, 10, 1, 190, -50)
        if centred_split_reversed_indices(pmag, directions) != pmagpy_split(pmag, directions)[2]:
            differing += 1
            first_differing = first_differing or directions

    cases = []
    for name, directions, extra in [
        ("single polarity, k 20, 30 directions", single_polarity, {}),
        ("dispersed and unbalanced, k 10, 30 N + 1 R", first_differing,
         {"differingDraws": differing, "draws": draws}),
    ]:
        cases.append({
            "name": name,
            **extra,
            "directions": directions,
            "pmagpy": {"reversedIndices": pmagpy_split(pmag, directions)[2]},
            "centredAxisEmulation": {"reversedIndices": centred_split_reversed_indices(pmag, directions)},
        })
    return cases


def manual_case(pmag, name, first, n1, k1, second, n2, k2):
    r1 = n1 - (n1 - 1) / k1
    r2 = n2 - (n2 - 1) / k2
    gamma = float(pmag.angle(first, second)[0])
    critical = critical_angle_eq15(n1, r1, n2, r2)
    return {
        "name": name,
        "first": first, "n1": n1, "k1": k1,
        "second": second, "n2": n2, "k2": k2,
        "pmagpy": {"gamma": gamma, "gammaCriticalEq15": critical,
                   "ipmagClassification": ipmag_classification(critical, gamma <= critical)},
    }


def kappa_for_critical_angle(n, target):
    """k (the same for two groups of n) whose eq. (15) critical angle is just above target, by bisection."""
    low, high = 1.0001, 1e9  # the critical angle decreases as k grows
    for _ in range(300):
        middle = math.sqrt(low * high)
        r = n - (n - 1) / middle
        if critical_angle_eq15(n, r, n, r) > target:
            low = middle
        else:
            high = middle
    return low


def manual_cases(pmag, classic):
    cases = [manual_case(pmag, "thesis Fig. 2.23 input", [215.5, -24.8], 78, 8.8, [25.4, 52.0], 146, 11.2)]
    for n in [5, 10, 30, 100]:
        for k in [5, 20, 100, 1000]:
            cases.append(manual_case(pmag, f"N {n} + {n + 3}, k {k} / {2 * k}", [10.0, 45.0], n, k,
                                     [14.0, 48.0], n + 3, 2 * k))
    # Just inside and just outside each class boundary (1e-7 degrees away, far above float noise).
    for target in [5, 10, 20]:
        for n in [8, 40]:
            for offset in [-1e-7, 1e-7]:
                kappa = kappa_for_critical_angle(n, target + offset)
                cases.append(manual_case(pmag, f"boundary {target} {offset:+g}, N {n} both", [0.0, 60.0], n, kappa,
                                         [1.0, 60.5], n, kappa))
    # The typed-mean form fed with the Fisher statistics of a classic case reproduces its critical angle.
    for case in classic:
        if case["name"].startswith("antipodal, k 20"):
            normal, reversed_mean = case["pmagpy"]["normalMean"], case["pmagpy"]["reversedMean"]
            cases.append(manual_case(pmag, f"Fisher statistics of classic case '{case['name']}'",
                                     [normal["dec"], normal["inc"]], normal["n"], normal["k"],
                                     [reversed_mean["dec"], reversed_mean["inc"]], reversed_mean["n"],
                                     reversed_mean["k"]))
    return cases


def bound_indices(count):
    # ipmag.common_mean_bootstrap and dataToReversalTest.ts both take int(0.025 n) / int(0.975 n) of the sorted values.
    return int(0.025 * count), int(0.975 * count)


def component_bounds(pmag, bootstrap_means):
    cartesian = np.array(pmag.dir2cart(bootstrap_means)).T
    lower, upper = bound_indices(len(bootstrap_means))
    bounds = {}
    for component, values in zip("xyz", cartesian):
        ordered = np.sort(values)
        bounds[component] = [float(ordered[lower]), float(ordered[upper])]
    return bounds


def exact_bound_atoms(pmag, group):
    """Every bootstrap mean component that can be the 1000-sample bound with probability > floor.

    A small group has few distinct resamples, so the bound is one of a few atoms rather than a
    roughly normal estimate; enumerate the multisets, their multinomial weights, and the
    order-statistic probability of each atom (P(bound <= a) = P(Binomial(1000, F(a)) > index))."""
    from scipy.stats import binom  # type: ignore[import-not-found]

    size = len(group)
    means, weights = [], []
    for multiset in itertools.combinations_with_replacement(range(size), size):
        counts = [multiset.count(index) for index in range(size)]
        weight = math.factorial(size) / math.prod(math.factorial(count) for count in counts) / size**size
        mean = pmag.fisher_mean([group[index] for index in multiset])
        means.append(np.ravel(pmag.dir2cart([mean["dec"], mean["inc"]])))
        weights.append(weight)
    atoms = {}
    for axis, component in enumerate("xyz"):
        values = {}
        for vector, weight in zip(means, weights):
            key = float(vector[axis])
            values[key] = values.get(key, 0) + weight
        ordered = sorted(values)
        cumulative = np.cumsum([values[value] for value in ordered])
        atoms[component] = []
        for index in bound_indices(BOOTSTRAP_SIMULATIONS):
            at_most = binom.sf(index, BOOTSTRAP_SIMULATIONS, np.clip(cumulative, 0, 1))
            probabilities = np.diff(np.concatenate([[0.0], at_most]))
            atoms[component].append([value for value, probability in zip(ordered, probabilities)
                                     if probability > ATOM_PROBABILITY_FLOOR])
    return atoms


def bootstrap_case(pmag, name, directions=None, source=None):
    if directions is None:
        reader = parse_dir_geographic if source.endswith(".dir") else parse_pmm_geographic
        directions = reader(source)
    normal, reversed_flipped, _ = pmagpy_split(pmag, directions)
    rng = np.random.default_rng(SEED)
    reference = {
        "first": component_bounds(pmag, pmag.di_boot(normal, nb=BOOTSTRAP_REFERENCE_SIMULATIONS, random_seed=rng)),
        "second": component_bounds(pmag, pmag.di_boot(reversed_flipped, nb=BOOTSTRAP_REFERENCE_SIMULATIONS,
                                                      random_seed=rng)),
    }
    runs = {"first": [], "second": []}
    for run in range(BOOTSTRAP_SPREAD_RUNS):
        run_rng = np.random.default_rng(SEED + 100 + run)
        for population, group in [("first", normal), ("second", reversed_flipped)]:
            runs[population].append(component_bounds(pmag, pmag.di_boot(group, nb=BOOTSTRAP_SIMULATIONS,
                                                                       random_seed=run_rng)))
    spread = {
        population: {
            component: [float(np.std([run[component][side] for run in runs[population]], ddof=1)) for side in (0, 1)]
            for component in "xyz"
        }
        for population in runs
    }
    case = {"name": name}
    if source:
        case["source"] = source
    else:
        case["directions"] = directions
    case["pmagpy"] = {"bounds": reference, "boundStandardDeviation1000": spread}
    if max(len(normal), len(reversed_flipped)) <= EXACT_BOOTSTRAP_MAX_GROUP:
        case["pmagpy"]["exactBoundAtoms"] = {"first": exact_bound_atoms(pmag, normal),
                                             "second": exact_bound_atoms(pmag, reversed_flipped)}
        for population in ("first", "second"):
            for component in "xyz":
                for side in (0, 1):
                    assert any(abs(reference[population][component][side] - atom) < 1e-12
                               for atom in case["pmagpy"]["exactBoundAtoms"][population][component][side])
    return case


def bootstrap_cases(pmag):
    rng = np.random.default_rng(SEED + 2)
    return [
        bootstrap_case(pmag, "test-data/sample.dir", source="test-data/sample.dir"),
        bootstrap_case(pmag, "src/assets/examples/exampleDIR.pmm", source="src/assets/examples/exampleDIR.pmm"),
        bootstrap_case(pmag, "antipodal, k 20 both, 15 N + 10 R",
                       fisher_set(pmag, rng, 20, 15, 10, 50) + fisher_set(pmag, rng, 20, 10, 190, -50)),
        bootstrap_case(pmag, "reversed mean 25 degrees off the antipode, k 20 both, 15 N + 12 R",
                       fisher_set(pmag, rng, 20, 15, 10, 50) + fisher_set(pmag, rng, 20, 12, 215, -40)),
    ]


def main() -> None:
    pmag = require_pmagpy()
    from pmagpy import ipmag  # type: ignore[import-not-found]

    assert_ipmag_thresholds_unchanged(ipmag)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    classic = classic_cases(pmag, ipmag)
    fixture = {
        "pmagpy_version": pmagpy_version(),
        "oracle": (
            "pmag.flip split; pmag.fisher_mean per group; gamma = pmag.angle of the means; critical angle = "
            "McFadden & McElhinny (1990) eq. (15), p = 0.05; ipmag.reversal_test_MM1990 (5000 Monte Carlo "
            "simulations) per seed; bootstrap bounds from pmag.di_boot as in ipmag.common_mean_bootstrap"
        ),
        "seed": SEED,
        "classic": classic,
        "splitDifferences": split_differences(pmag),
        "manual": manual_cases(pmag, classic),
        "bootstrap": bootstrap_cases(pmag),
    }
    OUTPUT_PATH.write_text(json.dumps(fixture, indent=2) + "\n")
    print(f"[pb10] wrote {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
