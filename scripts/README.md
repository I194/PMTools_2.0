# scripts/

Helper scripts for PMTools development. Run from the repo root.

## generateXlsxFixtures.js

Builds the binary `.xlsx` fixtures consumed by the `parserXLSX_*` reference-output
tests (`src/__tests__/fixtures/parsers/xlsx_{pmd,dir,sites_latlon}/synthetic/`).
Each XLSX parser is a thin wrapper — `XLSX.read(bytes)` → `xlsx_to_csv(workbook)` →
the matching CSV parser — so the fixtures mirror the already-reviewed CSV fixtures
cell-for-cell, with numbers as native numeric cells (the shape a real Excel sheet or
PMTools' own `toXLSX_*` export produces). One fixture (`with_empty_second_sheet`)
adds a trailing empty sheet to lock the only XLSX-specific behavior: `xlsx_to_csv`
skips sheets whose CSV is empty.

### When to run it

Only when a fixture's data changes. CI **never** runs it; Jest reads the committed
`.xlsx` files directly, and Node already has the `xlsx` dependency (no Python needed).

```bash
node scripts/generateXlsxFixtures.js            # (re)write the .xlsx files
node scripts/generateXlsxFixtures.js --print    # also dump the intermediate CSV
```

After regenerating, regenerate the references and **eyeball** them before committing:

```bash
UPDATE_FIXTURES=1 npm test -- --watchAll=false parserXLSX
npm test -- --watchAll=false parserXLSX         # prove they pass as committed
```

The reviewable surface is the `.expected.json` (every parsed number) plus this
script's inline source data — the `.xlsx` files themselves are binary. Each
reference should equal its CSV sibling's reference except `name`/`metadata.name`.

## generate_fixtures.py

Regenerates PmagPy comparison fixtures used by the Phase 1 Jest suite.
PmagPy is the de-facto standard paleomagnetism toolkit (Tauxe / Swanson-Hysell);
PMTools tests cross-check selected computations against it.

### When to run it

Only when adding or updating a fixture in `src/__tests__/fixtures/<topic>/`.
CI **never** runs this script — the test suite reads the committed
`*.pmagpy.json` files directly. Python is not required to run `npm test`.

### Setup

1. Python 3.9 or later (already on macOS by default; check `python3 --version`).
2. Install PmagPy:
   ```bash
   pip install pmagpy
   ```
3. Verify it imports:
   ```bash
   python3 -c "from pmagpy import pmag; print('pmagpy OK')"
   ```

The script writes `pmagpy_version` into every output JSON. The version is read
via `importlib.metadata.version("pmagpy")` (PyPI/installer metadata), not via
`pmagpy.__version__` — the latter is not reliably set on the package. Don't
bump the version casually: regeneration with a different PmagPy version may
produce floating-point drift that looks like a regression. If you do bump,
document it in the commit message and re-run `npm test` to confirm tolerances
still hold.

### Usage

```bash
# regenerate Fisher-mean fixtures
python3 scripts/generate_fixtures.py fisher

# regenerate everything that has an implemented generator
python3 scripts/generate_fixtures.py all

# overwrite existing outputs (default behavior is skip-if-exists)
python3 scripts/generate_fixtures.py fisher --force
```

### Conventions

PmagPy is unit-agnostic about labels but strict about expectations:

- **Angles are degrees**, never radians. `dec ∈ [0, 360)`, `inc ∈ [-90, 90]`.
- **Inclination sign**: positive = downward (paleomag standard, matches
  PMTools). A vector pointing into the ground has `inc > 0`.
- **Coordinate system**: PmagPy doesn't know whether your `[dec, inc]` is
  in specimen, geographic, or stratigraphic coordinates — it just runs the
  math. The fixture's `README.md` **must** state which coordinate system
  the input is in, otherwise PMTools-side parity assertions are ambiguous.
- **Hemisphere**: PmagPy returns lower-hemisphere directions by default
  (`pmag.doflip` is applied internally for principal components). PMTools
  matches this convention.

### Input format

Each fixture lives at `src/__tests__/fixtures/<topic>/<name>.input.json` and
the script writes `<name>.pmagpy.json` next to it.

| Topic | Input shape | PmagPy routine |
|---|---|---|
| `fisher` | `{ "directions": [[D, I], …] }` | `pmag.fisher_mean` |
| `pca` | `{ "directions": [[D, I, int], …], "calculation_type": "DE-BFL" \| "DE-BFL-A" \| "DE-BFP" }` | `pmag.domean` |
| `watson` | _stub_ | `pmag.watsons_v` (planned) |
| `vgp` | _stub_ | `pmag.dia_vgp` (planned) |
| `mcfadden` | _stub_ | `pmag.dolnp` (planned) |
| `fold_test` | _stub_ (Layer B, seeded `runFoldTest`) | `pmag.bootstrap_fold_test` (planned) |
| `fold_unfold` | self-generating (seed 42) — see `gen_foldtest.py` | `dotilt` + eigen (Layer A core: `findBed`/`unfold`) |
| `cutoff` | _stub_ | Vandamme cutoff (planned) |
| `bootstrap` | _stub_ | seeded bootstrap (planned) |

PCA notes:
- `directions` are PmagPy-native `[dec, inc, intensity]` rows. PMTools works
  internally in cartesian, so the fixture writer is responsible for the
  conversion when authoring the input. Intensity matters: `DE-BFL` (line fit)
  is weighted by vector magnitudes, so use the real demag-step magnitude;
  `DE-BFP` (plane fit) overwrites intensity with 1.0 internally, so any
  positive value works.
- Internally `gen_pca` wraps each row into the 6-column form
  `[step, dec, inc, intensity, "", "g"]` before calling `pmag.domean`. Index
  layout: `[0]` treatment step (synthesized as row index), `[1]` dec, `[2]`
  inc, `[3]` intensity, `[4]` Zijderveld step type (unused by `domean`),
  `[5]` quality flag (`'g'`/`'b'`). This wrapping is a `pmag.domean` API
  requirement, not part of the input.json schema; fixture authors keep
  writing `[dec, inc, intensity]` tuples.
- `calculation_type` defaults to `DE-BFL`. Use `DE-BFL-A` for anchored PCA
  (matches PMTools `calculatePCA_pmd(..., anchored=true)`) and `DE-BFP` for
  great-circle / plane fits (matches `calculatePCA_dir`).
- For `DE-BFP` the returned `dec`/`inc` is the **pole of the plane**, not
  a line direction, and `mad` follows thesis formula §1.2 (great-circle MAD)
  instead of §1.1 (vector MAD). Compare against the matching PMTools field.
- `pmag.doprinc` is intentionally **not** used: it expects `[dec, inc, int]`
  too (despite older docs suggesting cartesian), but it does not return MAD
  and has no anchored mode, so it can't act as a parity oracle for PMTools.

Field mappings in the output JSON:
- Fisher: `pmagpy alpha95 → fisher_mean.a95`. PMTools' `MeanDir.MAD` is
  semantically α95 for Fisher, despite the field name.
- Fisher edge cases: for `N == R` (perfectly parallel directions) PmagPy
  writes `k` as the **string** `"inf"` rather than a float, and `csd` as 0.
  For `N == 1` PmagPy returns only `dec`/`inc` and the script writes `null`
  for everything else. Both states are valid signals of degenerate input,
  not parity gates — flag in the fixture's `README.md`.
- PCA: `specimen_dec/inc/mad/dang/n → principal.dec/inc/mad/dang/n`. DANG
  (Demagnetization Angle — angle between the PCA line and the line from the
  center of mass to the origin) is captured as a free quality metric; PMTools
  computes the same value, so it makes a useful second parity axis once Step 2
  fixtures land. `center_of_mass` is omitted for now (np.array, fiddly to
  serialize); add it explicitly if a Step 2 fixture needs it.
- PCA `DE-BFL-A` exception: PmagPy's anchored path returns before computing
  DANG, so `principal.dang` is **always** `null` for anchored fixtures. This
  is a PmagPy quirk, not a script bug — don't add `dang` to the parity
  assertion when `calculation_type === "DE-BFL-A"`.

Stubs print an error and exit 1 — they are filled in as Phase 1 adds tests
for the corresponding statistics module. When you implement a stub:

1. Create `scripts/gen_<topic>.py` with a `gen_<topic>(args)` function (see
   `gen_fisher.py` / `gen_pca.py` for the pattern: import helpers from
   `_fixture_common`, call `require_pmagpy()`, iterate `discover_inputs`,
   write via `write_output`).
2. In `generate_fixtures.py`, replace the `gen_stub("<topic>")` entry in the
   `GENERATORS` dict with `from gen_<topic> import gen_<topic>` at the top
   and the imported function in the dict.
3. Document the input shape in this table.
4. Update the fixture's `README.md` so reviewers know what schema to use.

### Investigating PmagPy parity disagreements

If PMTools and PmagPy produce different output for the same input:

1. Verify the input file matches the schema above (typos and unit confusions —
   degrees vs. radians, intensity vs. unit vectors — are the most common cause).
2. Re-run with the latest stable PmagPy and compare against the cited PMTools
   thesis formula. The thesis cheat sheet lives at
   `src/__tests__/fixtures/THESIS_FORMULAS.md`.
3. The outcome is one of:
   - **PMTools has a bug.** Fix it in a `fix(science):` commit and add the
     failing fixture as the regression test. By default the thesis is the spec
     and code deviating from it is the bug.
   - **PMTools uses a different convention** (e.g., Watson F-test vs. Watson
     Vw, different α₉₅ approximation). Document the convention in the
     fixture's `README.md` and keep the PMTools-side `<name>.expected.json`
     as the source of truth. The PmagPy fixture is then a documented
     reference, not a parity gate.
   - **The thesis formula itself is wrong.** Hypothetically possible — the
     thesis was checked many times and the work is long-accepted by the
     paleomag community, but blind trust is still wrong for scientific code.
     If a derivation error in the thesis is found: cite the original source
     (Kirschvink 1980, Fisher 1953, etc.) in the fixture's `README.md`,
     update the thesis cheat sheet at `src/__tests__/fixtures/THESIS_FORMULAS.md`
     with a clarifying note, fix the code if needed in a `fix(science):` commit,
     and flag the discrepancy in the PR description so a domain expert reviews
     it before merge.
