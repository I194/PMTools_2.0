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
