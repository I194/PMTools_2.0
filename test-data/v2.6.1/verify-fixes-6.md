Check that Bug 1 and Bug 2 from evaluation-report-9.md are resolved:

1. **SQUID parser rejects header-only files**: Upload 10bg136b.squid (header only, no data rows) on PCA page. An alert should appear saying "Some files were skipped: 10bg136b.squid: No measurement data in .squid file: 10bg136b.squid" (or similar). The file should NOT appear in the file list.

2. **Magnetization graph handles empty data gracefully**: If any file with 0 data rows somehow gets loaded, the magnetization graph should show "Mmax = 0.00E+0 A/m" instead of "Mmax = -INFINITY A/m". Verify by loading a valid file (406c.squid), confirming the graph renders normally with a real Mmax value.

3. **Regression check — all previous fixes still work**:
   - Load 406c.squid (thermal demag) on PCA page. X-axis should show "°C" with range 0-600.
   - Check metadata editor: Core Azimuth, Core Dip, Bedding Strike show clean float values (no IEEE 754 artifacts).
   - In metadata editor, type "." then "5" in a numeric field — should show ".5", Apply should give 0.5. No NaN.
   - Create a new PCA interpretation — label should show "406c" (not "406c.squid").
   - Compute PCA on 406c.squid T420-T560 — MAD should be non-zero (around 29.7).
