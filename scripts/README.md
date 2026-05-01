# scripts/

Helper scripts for PMTools development. Run from the repo root.

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

The script writes `pmagpy_version` into every output JSON. Don't bump the
version casually: regeneration with a different PmagPy version may produce
floating-point drift that looks like a regression. If you do bump, document it
in the commit message and re-run `npm test` to confirm tolerances still hold.

### Usage

```bash
# regenerate Fisher-mean fixtures
python3 scripts/generate_fixtures.py fisher

# regenerate everything that has an implemented generator
python3 scripts/generate_fixtures.py all

# overwrite existing outputs (default behavior is skip-if-exists)
python3 scripts/generate_fixtures.py fisher --force
```

### Input format

Each fixture lives at `src/__tests__/fixtures/<topic>/<name>.input.json` and
the script writes `<name>.pmagpy.json` next to it.

| Topic | Input shape | PmagPy routine |
|---|---|---|
| `fisher` | `{ "directions": [[D, I], …] }` | `pmag.fisher_mean` |
| `pca` | `{ "vectors": [[x, y, z], …], "anchored": false }` | `pmag.doprinc` |
| `watson` | _stub_ | `pmag.watsons_v` (planned) |
| `vgp` | _stub_ | `pmag.dia_vgp` (planned) |
| `mcfadden` | _stub_ | `pmag.dolnp` (planned) |
| `fold-test` | _stub_ | `pmag.bootstrap_fold_test` (planned) |
| `cutoff` | _stub_ | Vandamme cutoff (planned) |
| `bootstrap` | _stub_ | seeded bootstrap (planned) |

Stubs print an error and exit 1 — they are filled in as Phase 1 adds tests
for the corresponding statistics module. When you implement a stub:

1. Add the per-topic `gen_<topic>` function in `generate_fixtures.py`.
2. Document the input shape in this table.
3. Update the fixture's `SOURCE.md` so reviewers know what schema to use.

### Investigating PmagPy parity disagreements

If PMTools and PmagPy produce different output for the same input:

1. Verify the input file matches the schema above (typos and unit confusions —
   degrees vs. radians, intensity vs. unit vectors — are the most common cause).
2. Re-run with the latest stable PmagPy and compare against the cited PMTools
   thesis formula. The thesis cheat sheet lives at
   `src/__tests__/fixtures/THESIS_FORMULAS.md`.
3. The outcome is one of:
   - **PMTools has a bug.** Fix it in a `fix(science):` commit and add the
     failing fixture as the regression test. The thesis is the spec; the code
     deviating from it is the bug.
   - **PMTools uses a different convention** (e.g., Watson F-test vs. Watson
     Vw, different α₉₅ approximation). Document the convention in the
     fixture's `SOURCE.md` and keep the PMTools-side `<name>.expected.json`
     as the source of truth. The PmagPy fixture is then a documented
     reference, not a parity gate.
