# PMTools thesis formulas — cheatsheet

Reference copy of every formula listed in chapter 1 of `src/assets/PMTools_how_to_use.pdf`
(diploma thesis "Новое программное обеспечение для палеомагнитных операций и его
практическое использование", Ефремов И. В., 2022). Test authors **must** cite the
formula number in a comment on every test that exercises one of these formulas, e.g.

```ts
// PMTools_how_to_use.pdf §1.1 — vector MAD
```

This file is the cheat sheet. The PDF remains the authoritative source — if there is
ever a disagreement, the PDF wins and this file gets updated.

---

## §1.1 — MAD for vectors (Kirschvink 1980)

```
MAD = arctan( sqrt( (λ_int + λ_min) / λ_max ) )
```

Eigenvalues come from the covariance matrix H of demagnetization steps (§1.3).
λ_max is the largest eigenvalue (principal direction); λ_int and λ_min are the
intermediate and minimum eigenvalues. Output in radians; PMTools converts to degrees.

## §1.2 — MAD for great-circle planes

```
MAD = arctan( sqrt( λ_min/λ_int + λ_min/λ_max ) )
```

Used when PCA is fit as a plane (great circle) rather than a line.

## §1.3 — Covariance matrix H

For N demagnetization step vectors **xᵢ** = (xᵢ, yᵢ, zᵢ), centered on the centroid:

```
H_jk = Σᵢ (xᵢⱼ − x̄_j)(xᵢₖ − x̄_k)
```

Eigendecomposition of H produces (λ_max, λ_int, λ_min) and their unit eigenvectors.

## §1.4 — Fisher concentration κ

```
k = (N − 1) / (N − R)
```

Where R = |Σ unit vectors| (resultant length).

## §1.5 — Fisher α₁₋ₚ confidence cone

```
α_{1−p} = arccos( 1 − ((N − R)/R) · ((1/p)^(1/(N−1)) − 1) )
```

Standard `p = 0.05` → α₉₅. Output in radians; PMTools converts to degrees.

## §1.4.1 — Watson randomness test

```
R₀ = sqrt( 7.815 · N / 3 )
R  = sqrt( (Σxᵢ)² + (Σyᵢ)² + (Σzᵢ)² )
```

Reject the null of randomness when R > R₀. The constant 7.815 is the χ²(0.05, 3) critical
value. Used in `conglomeratesTest`.

## §1.6 — McElhinny κ-ratio F-test (classical fold test)

Compare κ_geo and κ_strat using an F-test with appropriately weighted degrees of freedom.

## §1.7 — Watson F-statistic (common mean)

```
F = (N − 2)(R₁ + R₂ − R) / (N − R₁ − R₂)
```

Where R₁, R₂ are resultants of the two samples and R is the resultant of the pooled sample.

## §1.8–1.11 — Vw statistic (Watson 1983 modified common-mean test)

```
Sw   = k₁·R₁ + k₂·R₂                       (1.8)
X̂_j  = k₁·R₁·x̄_{1j} + k₂·R₂·x̄_{2j}      (1.9)
Rw   = sqrt( X̂₁² + X̂₂² + X̂₃² )            (1.10)
Vw   = 2 · (Sw − Rw)                       (1.11)
```

Used by the modified reversal/common-mean test.

## §1.12 — Fold test scatter matrix T

```
T_jk = Σᵢ x̂_{ij} · x̂_{ik}
```

Sum over unit vectors x̂ᵢ. The largest eigenvalue τ₁ of T is the bootstrap fold-test
statistic; the optimal unfolding angle maximizes τ₁.

## §1.4.2 — Reversal test (McFadden & McElhinny 1990)

Classification rule for the Watson Vw statistic: A / B / C / Indeterminate based on
the implied angular separation of the two means.

## §1.5 — Bootstrap procedure (Efron 1979 / Tauxe 1991)

Resample N vectors with replacement, compute Fisher mean of the resample, repeat Q times.
The bootstrap distribution of means produces parametric-free confidence intervals.

## McFadden 1988 — combined remagnetization circles + direct observations

Iterative algorithm for a Fisher mean over a dataset that mixes interpreted directions
with great-circle planes. Each great circle's pole is iteratively reflected toward the
running mean until the mean stabilizes.

---

## Cross-references

- **Fisher 1953** — original derivation of (1.4), (1.5).
- **Tauxe "Essentials of Paleomagnetism" 2010** — worked examples for PCA, VGP, fold test.
- **Butler "Paleomagnetism: Magnetic Domains to Geologic Terranes"** — VGP conversion examples.
- **McFadden & McElhinny 1990** — reversal-test classification rules cited in §1.4.2.
- **McFadden 1988** — combined directions+circles method.
- **Watson 1956, 1983** — randomness test and Vw statistic.
- **Efron 1979 / Tauxe 1991** — bootstrap method.
- **Kirschvink 1980** — original MAD definition cited in §1.1.
- **Vandamme** — cutoff reference (used by `calculateCutoff`).
