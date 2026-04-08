# Test Data for Evaluator Agent

Sample files for automated UI testing via Playwright MCP.

## Files

### sample.pmd
Minimal PMD file with 8 thermal demagnetization steps (T000–T600).
- **Use case**: Load on PCA page, verify Zijderveld/stereo/mag graphs render
- **Expected**: Clear linear trend suitable for PCA line fitting (steps T100–T600)
- **Metadata**: azimuth=0, dip=0, strike=220, bedding dip=30

### sample.dir
8 directional interpretations (GC code) — mix of normal and reversed polarity.
- **Use case**: Load on DIR page, verify stereo plot and Fisher statistics
- **Expected**: Two clusters (normal ~340/37, reversed ~145/-42) visible on stereoplot
- **Fisher mean**: should produce reasonable k and α95 values for each polarity group
