# verify-fixes — SCI-01 (fold test: 90-degree axis error + findBed dip normalization)

Branch: `fix/sci-01-fold-test-unfold-axis`. Paste the prompt below into `/evaluate`.

---

Verify the two fold-test fixes on branch `fix/sci-01-fold-test-unfold-axis`. The dev server
must be running on localhost:3000 from this branch.

Both test files are committed at `test-data/v2.6.6/sci-01/`. Each is a synthetic fold built by
folding a tight cluster of pre-fold directions down onto known beddings, so **the correct
best-unfolding percentage is near 100 %** by construction. PmagPy's own answers on the exact
same directions are in `test-data/v2.6.6/sci-01/oracle.json`.

Important: the fold test runs a **1000-draw bootstrap**, so the displayed *range* line is
stochastic and will differ between runs. The number to check is the **best-unfolding
percentage** on the first result line, and it is a finite-sample optimum — a couple of per
cent of spread is expected and fine. What must NOT happen is an answer tens of per cent away,
or an answer pinned to the −50 / 150 grid edges.

## 1. Two-limb fold reads ~98 %, not a grid edge

1. Go to `/app/dir`.
2. Upload `test-data/v2.6.6/sci-01/two_limb_fold.dir`. Confirm the table shows **18
   directions** and no validation-error modal appears.
3. In the tools panel, under **"Hypothesis testing"**, click **"Paleomagnetic tests"**.
4. The modal opens on the **"Fold Test (Bootstrap Version)"** tab. Click **"Run"**. The button
   reads "Processing..." while the 1000 draws run.
5. When it finishes, read the first result line: *"The densest grouping of vectors (accuracy,
   95% confidence interval) is observed on:"*.
   - **PASS:** the best-unfolding percentage is in the **90–105** range (PmagPy says 98, the
     deterministic core gives exactly 98).
   - **FAIL:** anything near 150, near −50, or below about 80. Before this fix the same file
     gave **150**.
6. Look at the fold-test graph. The tau1 curve must **rise** from left to right and peak near
   100 %, then fall. Before the fix it peaked at the right-hand edge.
7. Screenshot the result lines and the graph.

## 2. Overturned limb reads ~101 % — this is the case that needs BOTH fixes

1. Still on `/app/dir`, upload `test-data/v2.6.6/sci-01/overturned_limb.dir`. 18 directions,
   no validation errors. (One limb of this fold is overturned: bed dips 95–140 degrees.)
2. Open **"Paleomagnetic tests"** → **"Fold Test (Bootstrap Version)"** → **"Run"**.
3. Read the best-unfolding percentage.
   - **PASS:** in the **95–108** range (PmagPy says 101, the deterministic core gives exactly
     101).
   - **FAIL:** near 83, which is what this file gave before the fix, or near 99, which is what
     it gave with only half the fix applied.
4. Screenshot the result lines and the graph.

## 3. Ordinary data still behaves and nothing else regressed

1. Upload `test-data/sample.dir` (or `test-data/field_batch.dir`) on `/app/dir`.
2. Run the fold test. It must complete, print both result lines, and draw a graph — no crash,
   no `NaN`, no blank panel, no empty "—" in the range line.
3. In the same modal, click through the other three tabs — **"Reversal Tests (Automatic)"**,
   **"Reversal Test (manual input)"**, **"Conglomerate Test"** — and confirm each still renders
   and runs. None of them were touched, so any change there is a regression.
4. Open DevTools console. There must be no new errors or warnings from the fold test.

## 4. Changelog

1. Reload the app (or open the changelog from the UI) and find the **2.6.6** entry.
2. It must contain three new fold-test lines: the 90-degree axis error, the vertical/overturned
   bed fix, and the advice to re-run fold tests made with earlier versions.
3. Check both languages — switch to Russian and confirm the changelog and the DIR tools panel
   still render correctly (the changelog text itself is English-only by design; flag it if that
   looks wrong to you).

## 5. Report

For each numbered section: PASS/FAIL, the actual best-unfolding percentage you read, and a
screenshot. If a percentage falls outside the stated band, re-run the test two more times
before calling it a FAIL — the bootstrap is stochastic — and report all three readings.
