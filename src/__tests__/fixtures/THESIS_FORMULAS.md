# PMTools thesis formulas — cheatsheet

Reference copy of every formula listed in chapter 1 of `src/assets/PMTools_how_to_use.pdf`
(diploma thesis "Новое программное обеспечение для палеомагнитных операций и его
практическое использование", Ефремов И. В., 2022). Test authors **must** cite the
formula number in a comment on every test that exercises one of these formulas, e.g.

```ts
// PMTools_how_to_use.pdf formula (1.1) — vector MAD
```

This file is the cheat sheet. The PDF remains the authoritative source — if there is
ever a disagreement, the PDF wins and this file gets updated.

## Notation conventions

The PDF uses two independent numbering systems that look similar but mean different things:

- **Section numbers** appear left-aligned as headings: `1.1.`, `1.2.`, `1.3.`, `1.4.`, `1.5.`,
  with subsections `1.4.1`, `1.4.2`, `1.5.1`. Cited here as `§1.4.1`, `§1.5.1`, etc.
- **Formula numbers** appear right-aligned in parentheses next to each equation: `(1.1)`,
  `(1.2)`, …, `(1.12)`. The numbering is sequential across the whole chapter and is **not**
  tied to the section number. Cited here as `formula (1.6)`, `formulas (1.8)–(1.11)`, etc.

Example: `formula (1.6)` lives inside `§1.4.1` ("Тесты значимости" → "Сравнение кучностей").
Always write `formula (X.Y)` when referencing a numbered equation, never `§X.Y` — that would
point to the wrong place in the PDF.

---

## formula (1.1) — MAD for vectors (Kirschvink 1980)

```
MAD = arctan( sqrt( (λ_int + λ_min) / λ_max ) )
```

Lives in §1.3 "Распределения векторов на сфере". Eigenvalues come from the covariance
matrix H of demagnetization steps (formula (1.3)). λ_max is the largest eigenvalue
(principal direction); λ_int and λ_min are the intermediate and minimum eigenvalues.
Output in radians; PMTools converts to degrees.

## formula (1.2) — MAD for great-circle planes

```
MAD = arctan( sqrt( λ_min/λ_int + λ_min/λ_max ) )
```

Lives in §1.3. Used when PCA is fit as a plane (great circle) rather than a line.

## formula (1.3) — Covariance matrix H

For N demagnetization step vectors **xᵢ** = (xᵢ, yᵢ, zᵢ), centered on the centroid:

```
H_jk = Σᵢ (xᵢⱼ − x̄_j)(xᵢₖ − x̄_k)
```

Lives in §1.3. Eigendecomposition of H produces (λ_max, λ_int, λ_min) and their unit
eigenvectors.

## formula (1.4) — Fisher concentration κ (Khramov 1982)

```
k = (N − 1) / (N − R)
```

Lives in §1.3. Where R = |Σ unit vectors| (resultant length). Cited in the PDF as
[Храмов, 1982]; the original distribution itself is from Fisher 1953.

## formula (1.5) — Fisher α₁₋ₚ confidence cone (Khramov 1982)

```
α_{1−p} = arccos( 1 − ((N − R)/R) · ((1/p)^(1/(N−1)) − 1) )
```

Lives in §1.3. Standard `p = 0.05` → α₉₅. Cited in the PDF as [Храмов, 1982]. Output in
radians; PMTools converts to degrees.

## §1.4.1 «Тест на случайность» — Watson randomness test (Watson 1956)

```
R₀ = sqrt( 7.815 · N / 3 )
R  = sqrt( (Σxᵢ)² + (Σyᵢ)² + (Σzᵢ)² )
```

This formula appears in the PDF without a number — it lives in subsection §1.4.1
"Тесты значимости" → "Тест на случайность". Reject the null of randomness when R > R₀.
The constant 7.815 is the χ²(0.05, 3) critical value. Used in `conglomeratesTest`.

## formula (1.6) — McElhinny κ-ratio F-test (McElhinny 1964)

```
k₁ / k₂ = var(2·(N₂ − 1)) / var(2·(N₁ − 1))
```

Lives in §1.4.1 "Тесты значимости" → "Сравнение кучностей". `var(2·(N₂−1))` and
`var(2·(N₁−1))` are variances with `2·(N₂−1)` and `2·(N₁−1)` degrees of freedom. The
ratio should follow an F-distribution under the null hypothesis that the two samples
share a common κ; comparing it against tabulated F-critical values at p = 0.05 is the
classical fold test.

## formula (1.7) — Watson F-statistic for common mean (Watson 1956)

```
F = (N − 2)·(R₁ + R₂ − R) / (N − R₁ − R₂)
```

Lives in §1.4.1 "Тесты значимости" → "Тест на общее среднее". `R₁`, `R₂` are resultants
of the two samples and `R` is the resultant of the pooled sample, with `N = N₁ + N₂`.

## formulas (1.8)–(1.11) — Vw statistic (Watson 1983, modified common-mean test)

```
Sw   = k₁·R₁ + k₂·R₂                       (1.8)
X̂_j  = k₁·R₁·x̄_{1j} + k₂·R₂·x̄_{2j}      (1.9)
Rw   = sqrt( X̂₁² + X̂₂² + X̂₃² )            (1.10)
Vw   = 2·(Sw − Rw)                         (1.11)
```

Lives in §1.4.1 "Тесты значимости" → "Тест на общее среднее" (the Watson 1983 alternative
to formula (1.7)). Critical Vw value found via Monte Carlo. Used by the modified
reversal/common-mean test.

## formula (1.12) — Fold test scatter matrix T (modified fold test, §1.5.1)

```
T_jk = Σᵢ x̂_{ij} · x̂_{ik}
```

Lives in §1.5.1 "Модификации тестов" → "Модификация теста складки". Sum over **unit**
vectors x̂ᵢ. The largest eigenvalue τ₁ of T is the bootstrap fold-test statistic; the
optimal unfolding angle maximizes τ₁.

## §1.4.2 «Тест обращения» — Reversal test

Lives in subsection §1.4.2 "Полевые тесты и тест обращения" → "Тест обращения". The PDF
introduces no new formulas here: mathematically the test reduces to the common-mean test
(formula (1.7) or formulas (1.8)–(1.11)) applied to the normal-polarity and
reversed-polarity sample groups. The McFadden & McElhinny 1990 A/B/C/Indeterminate
classification rule for the Vw statistic is the standard interpretation layer on top.

## §1.5 «Метод Bootstrap» — Bootstrap procedure (Efron 1979 / Tauxe 1991)

Section §1.5 introduces no numbered formulas — only the algorithm: resample N vectors
with replacement, compute Fisher mean of the resample, repeat Q times. The bootstrap
distribution of means produces parametric-free confidence intervals.

## §1.3 (no numbered formula) — McFadden 1988 combined remagnetization circles

Mentioned at the end of §1.3. Iterative algorithm for a Fisher mean over a dataset that
mixes interpreted directions with great-circle planes. Each great circle's pole is
iteratively reflected toward the running mean until the mean stabilizes.

---

## Cross-references

- **Fisher 1953** — original derivation of the Fisher distribution; formulas (1.4) and (1.5)
  in PMTools form ultimately trace back here.
- **Khramov 1982 (Храмов А. Н., «Палеомагнитология»)** — actual citation in the PDF for
  formulas (1.4) and (1.5). Use this as the reference label in PMTools fixture files since
  the PDF cites it directly.
- **Tauxe "Essentials of Paleomagnetism" 2010** — worked examples for PCA, VGP, fold test.
- **Butler "Paleomagnetism: Magnetic Domains to Geologic Terranes"** — VGP conversion examples.
- **McFadden & McElhinny 1990** — reversal-test classification rules cited in §1.4.2.
- **McFadden 1988** — combined directions+circles method (mentioned in §1.3).
- **Watson 1956** — randomness test (§1.4.1) and F-statistic for common mean (formula (1.7)).
- **Watson 1983** — Vw statistic (formulas (1.8)–(1.11)).
- **McElhinny 1964** — κ-ratio F-test (formula (1.6)).
- **Efron 1979 / Tauxe 1991** — bootstrap method (§1.5).
- **Kirschvink 1980** — original MAD definition referenced by formulas (1.1) and (1.2).
- **Vandamme** — cutoff reference (used by `calculateCutoff`; not in the thesis chapter 1).
