# SCI-01 verification data

Two synthetic folds with a known answer, for verifying the fold-test fixes by hand in the
running app. Regenerate with:

```
python3 test-data/v2.6.6/sci-01/gen_sci01_verification_data.py
```

Each is a tight Fisher cluster of pre-fold directions folded down onto per-site beddings, so
unfolding to 100 % recovers the cluster and the fold test must peak near 100 %. `oracle.json`
records PmagPy 4.3.14's own fold test on the same directions, on a 1 % grid.

- `two_limb_fold.dir` — 18 sites, two limbs dipping away from each other, dips 25…60.
  Exercises the call-site fix.
- `overturned_limb.dir` — 18 sites, one limb overturned (dips 95…140), the other upright.
  The dip azimuths are chosen so `findBed` lands in the branch the NEW-A normalization fixes.

## Measured best-unfolding percentage

Single deterministic `unfold` pass over all 18 directions (what the bootstrap's draws centre
on), measured by checking out each revision of `foldTestBootstrap.ts` in turn:

| dataset | PmagPy (1 % grid) | dev, before | call-site fix only | both fixes (this branch) |
|---|---|---|---|---|
| `two_limb_fold` | 98 | **150** | 98 | **98** |
| `overturned_limb` | 101 | **83** | 99 | **101** |

The overturned row is the one that shows why both fixes ship together: the call-site fix alone
moves it from 83 to 99, still 2 % off, because `findBed` was handing back dips of 265…220
instead of 95…140. With the normalization the recovered dips are exactly the beddings the
generator used, and the answer matches PmagPy.

The app runs a 1000-draw bootstrap on top of this, so the displayed **bounds** are stochastic
and will differ run to run. The best-unfolding percentage is the number to compare.

## For the PR description: one commit message carries a superseded claim

The message of commit `4dc785a` ("fix(science): normalize findBed dips past 180 degrees")
ends with *"Vertical beds (dip exactly 90, cosdip = 0) are untouched."* **That is wrong**, and
the science review caught it. At dip exactly 90 `cosdip` is not 0 — it is a float residue of
order 1e-16 whose sign is arbitrary, so about half of exactly-vertical beds did take the long
arc before this fix. Two of six measured cases did:

```
true azimuth 313.5024, dip 90 -> pre-fix (133.5024, 270.0), fractional-unfold error  98.67 deg
true azimuth 186.0364, dip 90 -> pre-fix (  6.0364, 270.0), fractional-unfold error 150.68 deg
```

The reassuring half of that finding is real and stands: **after** the normalization both
residue signs yield the same bedding, so the vertical boundary is no longer float-sensitive.

The commit message was left as written rather than reworded, because `git rebase -i` is not
supported in this environment and mangling a seven-commit branch to fix a paragraph is a bad
trade. The corrected wording is in `found-bugs-todo.md` and in the test comments; please carry
this correction into the PR description.
