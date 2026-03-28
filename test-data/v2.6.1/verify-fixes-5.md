Check that all fixes from evaluation-report-8.md are resolved:

1. **Magnetization graph shows correct unit for thermal data**: Upload `.claude/issues/RV-march-2026/406c.squid` on PCA page. Click the "RMG" tab to view the magnetization decay graph. The x-axis label should show "°C" (not "mT") since this is thermal demagnetization data. Also test with an AF demagnetization file (e.g., a .pmd file) — x-axis should still show "mT".

2. **Metadata editor shows clean float values**: Upload `406c.squid` on PCA page. Click the Edit (pencil) icon in the metadata row. Core Azimuth should show a clean number like `38.6` (not `38.599999999999994`). All other fields (Core Dip, Bedding Strike, Bedding Dip, Volume) should also show clean values without IEEE 754 artifacts.

3. **Metadata editor handles decimal input without NaN**: In the metadata editor (from step 2), clear the Core Dip field completely and type just `.` (period). The field should NOT show NaN — it should accept the intermediate input. Then type `5` so the field shows `.5` or `0.5`. Press Apply — the value should be applied as `0.5`. Also try typing `,5` (comma as decimal separator for Russian locale) — should work the same way.

4. **Interpretation labels don't include file extension**: Upload a `.squid` or `.pmd` file on PCA page. Select some steps and compute a PCA direction (Odir). In the interpretations table, the label column should show the filename WITHOUT extension (e.g., `406c` not `406c.squid`). Export to DIR format — labels should also be without extension.

5. **Rejected files show error reason in alert**: Load a valid file (e.g., `406c.squid`) on PCA page. Then upload `.claude/issues/RV-march-2026/10bg136b.squid` (header only, no data rows). An alert should appear that includes both the filename AND the reason it was skipped (e.g., "no data lines"). Previously loaded data and interpretations should be preserved.

6. **MAD values for PCA**: Upload `.claude/issues/AP-march-2026/a11-19.squid` on PCA page. Select steps in the T510-T700 range, compute PCA line (Odir). MAD should be a reasonable positive value (typically 1-15 degrees for real data), not exactly 0.0. Also test with `406c.squid` — select any range of steps and compute PCA, verify MAD is non-zero.
