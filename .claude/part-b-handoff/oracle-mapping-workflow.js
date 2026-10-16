export const meta = {
  name: 'part-b-oracle-mapping',
  description: 'Map every Part B computation to its exact PmagPy 4.3.14 oracle, verify adversarially (source + empirical), adjudicate, and check table completeness',
  phases: [
    { title: 'Map', detail: 'one agent per PB row: PMTools live path + PmagPy source + run both' },
    { title: 'Inventory', detail: 'every number PMTools shows, mapped to a row or flagged uncovered' },
    { title: 'Verify', detail: 'two refuters per row: source re-derivation and independent numerical runs' },
    { title: 'Adjudicate', detail: 'resolve disputed rows with evidence' },
    { title: 'Critic', detail: 'completeness and contradictions across all rows' },
  ],
}

const SCRATCH = '/private/tmp/claude-501/-Users-i1948374-PMTools/bdb3b478-28ac-4114-92f5-3720a2d0303d/scratchpad'
const PMAGPY = '/Users/i1948374/Library/Python/3.9/lib/python/site-packages/pmagpy'

const COMMON = (tag) => `
CONTEXT
PMTools (repo /Users/i1948374/PMTools, TypeScript/React, fully client-side) is a paleomagnetic data-analysis web app. We are reviewing the "Computations" table in .claude/development-roadmap/part-b-plan.md (PR #55). Each row names a PMTools computation and the PmagPy function(s) proposed as its test oracle; Part B will later write one parity test per row against that oracle. The owner (Ivan) is no longer a practising paleomagnetist and cannot check the science himself; he relies on this review being exactly right. Precision beats coverage: every claim must rest on a file:line you actually opened or a command you actually ran. Never rely on memory of PmagPy or the literature when the source can be read. If you could not verify something, say "not verified" explicitly.

SOURCES
- PMTools source: /Users/i1948374/PMTools/src. Computations in src/utils/statistics/** and src/utils/graphs/**; dispatchers src/utils/statistics/calculateStatisticsPMD.ts (PCA page) and calculateStatisticsDIR.ts (DIR page); UI in src/pages/** and src/components/**; Redux slices in src/services/reducers/**; parsers in src/utils/files/parsers/**; types in src/utils/GlobalTypes.ts and src/utils/graphs/types.ts.
- PmagPy 4.3.14 (the pinned oracle version) is installed at ${PMAGPY}/ (pmag.py ~13.9k lines, ipmag.py ~16.4k lines, also convert_2_magic.py, pmagplotlib.py). Cite as pmag.py:LINE / ipmag.py:LINE. Run it with python3 ("from pmagpy import pmag, ipmag"; ignore urllib3/cartopy warnings on stderr). For plotting functions set MPLBACKEND=Agg. If a function prints or plots instead of returning, capture stdout and say so.
- Thesis (authoritative spec of PMTools formulas, Russian, Efremov 2022): plain text at ${SCRATCH}/thesis.txt (section 1.3 distributions ~line 295, 1.4 tests ~375-560, 1.5 bootstrap ~561-640, UI chapters later). Published paper text: ${SCRATCH}/FZE0150.txt.
- Known-bug catalog: .claude/development-roadmap/notes/found-bugs-todo.md; ledger .claude/progress.json (SCI-nn items). Existing oracle generators: scripts/gen_*.py, scripts/_fixture_common.py; fixtures under src/__tests__/fixtures/; real data in src/assets/examples/ and test-data/.

RUNNING PMTOOLS CODE (verified to work, ~2 s per run)
1. mkdir -p /Users/i1948374/PMTools/src/__pb_scratch__/${tag}/ and create a Jest test there (e.g. probe.test.ts) with a Bash heredoc (do NOT use the Write/Edit tools for it: a lint hook fires on those). Import PMTools functions by relative path (e.g. '../../utils/statistics/calculation/calculateFisherMean'). Write results as JSON with fs.writeFileSync into ${SCRATCH}/${tag}/ (mkdir it). Do not use console.log.
2. cd /Users/i1948374/PMTools && CI=true npx react-scripts test --watchAll=false --testPathPattern='__pb_scratch__/${tag}/'
3. Keep Python scripts and outputs in ${SCRATCH}/${tag}/.
4. MANDATORY before you finish: rm -rf /Users/i1948374/PMTools/src/__pb_scratch__/${tag} and confirm it is gone (set scratch_cleaned accordingly).

HARD RULES
Read-only everywhere except your own two scratch folders above. Do not create, modify or delete any other file in the repo. No state-changing git commands. Never touch src/utils/statistics/** or any *.expected.json. Do not fix anything: mismatches are recorded, not fixed.
`

const ROWS = [
  {
    id: 'PB-01', title: 'Specimen -> geographic -> stratigraphic coordinates',
    pmtoolsCell: 'Specimen -> geographic -> stratigraphic (toReferenceCoordinates, Coordinates.correctBedding)',
    oracleCell: 'pmag.dogeo, pmag.dotilt', status: 'todo',
    hints: 'src/utils/graphs/formatters/toReferenceCoordinates.ts, src/utils/graphs/formatters/fromReferenceCoordinates.ts, src/utils/graphs/classes/Coordinates.ts and Direction.ts. The orientation fields come from the parsers in src/utils/files/parsers/ (PMD, RS3, SQUID, CSV, XLSX, MDIR, PMM ...) and types in src/utils/GlobalTypes.ts. The DIR page receives Dgeo/Igeo/Dstrat/Istrat already computed (from files or from PCA-page interpretations); check whether any DIR-page path recomputes them. Check that the name "Coordinates.correctBedding" in the table actually exists.',
    focus: 'Orientation conventions are the whole game. What PMTools reads from each file format (e.g. PMD header fields a/b/s/d: is b the core dip, the hade (90 - plunge) or the plunge? is s the strike or the dip direction, and which right-hand rule?) versus what pmag.dogeo(dec, inc, az, pl) and pmag.dotilt(dec, inc, bed_az, bed_dip) expect. Check how PmagPy itself imports the same formats (convert_2_magic.py: its PMD/Enkin importer, RS3/UTRECHT/SQUID/JR6 if relevant, and the orientation conventions it applies such as orientation_priority or "or_con" conversions in pmag.orient / ipmag.orientation_magic) because that defines the adapter. Also consider pmag.dogeo_V, pmag.dotilt_V and pmag.dostrat if relevant. Edge cases: vertical bed (dip 90), overturned bed (dip > 90 or flagged), core dip 0 and 90, declination wrap at 0/360, inclination +-90.',
  },
  {
    id: 'PB-02', title: 'Fisher mean, k, a95',
    pmtoolsCell: 'Fisher mean, k, a95 (calculateFisherMean)', oracleCell: 'pmag.fisher_mean', status: 'todo',
    hints: 'src/utils/statistics/calculation/calculateFisherMean.ts (fisherMean); DIR page mode "fisher" via src/utils/statistics/calculateStatisticsDIR.ts (note: it rounds every input direction to 0.1 deg and flips reversed-polarity directions before averaging); formatter src/utils/statistics/formtatters/rawStatisticsDIRToInterpretation.ts. fisherMean is reused by other computations (VGP mean pole, tests, bootstrap): list every caller. Existing: scripts/gen_fisher.py, fixtures under src/__tests__/fixtures/ (fisher, computations/fisher_mean).',
    focus: 'k = (N-1)/(N-R); a95 via cos a95 = 1 - (N-R)/R * (20^(1/(N-1)) - 1) and the clamp when the argument < -1; csd = 81/sqrt(k). Behaviour of each side at N=1, N=2, all-identical directions (R=N, k infinite), antipodal pair (R=0), near-vertical directions. Is the field PMTools stores as "MAD" really a95 for this mode, and what does the UI label it? Does the PCA page also offer a Fisher mean of demagnetization steps (pmag.domean "DE-FM")? If so, include it in this row or propose a separate row.',
  },
  {
    id: 'PB-03', title: 'PCA on demagnetization steps',
    pmtoolsCell: 'PCA on demag steps: line, anchored line, plane, MAD (calculatePCA_pmd)', oracleCell: 'pmag.domean DE-BFL / DE-BFL-A / DE-BFP', status: 'todo',
    hints: 'src/utils/statistics/calculateStatisticsPMD.ts maps PCA-page modes to calculatePCA_pmd(selectedSteps, anchored, normalized, type): "pca" = free line, "pca0" = anchored line, "gc" = plane with anchored=true, "gcn" = plane, anchored, normalized. Check src/utils/graphs/types.ts for the full StatisticsModePCA list. Math in src/utils/statistics/calculation/calculatePCA_pmd.ts, eigManipulations.ts, matrix.ts; output formatter formtatters/rawStatisticsPMDToInterpretation.ts. Existing: scripts/gen_pca.py (uses pmag.domean), fixtures under src/__tests__/fixtures/ (pca, computations/pca_pmd or similar).',
    focus: 'For each PCA-page mode find the exact PmagPy equivalent among DE-BFL (free line, centre of mass), DE-BFL-A (anchored: how exactly does PmagPy anchor?), DE-BFL-O (origin added as an extra point), DE-BFP (plane: centred or through the origin?), DE-FM. Compare: centring, inclusion of the origin, MAD formula (Kirschvink 1980: line MAD = atan(sqrt((e2+e3)/e1)), plane MAD = atan(sqrt(e3/e2 + e3/e1))), eigenvalue normalisation, how the line orientation sign is chosen, the pole sign for planes, whether "gcn" (unit-vector-normalised steps) has any PmagPy equivalent (e.g. domean on rows with intensity set to 1), DANG, and the coordinate frame of the inputs (specimen/geographic/stratigraphic). Which number PMTools shows as MAD for each mode and whether it equals PmagPy specimen_mad. Use real PMD files from src/assets/examples/ as one input.',
  },
  {
    id: 'PB-04', title: 'PCA on directions (DIR page)',
    pmtoolsCell: 'PCA on directions (calculatePCA_dir)', oracleCell: 'pmag.doprinc', status: 'todo',
    hints: 'DIR page mode "gc" in src/utils/statistics/calculateStatisticsDIR.ts calls src/utils/statistics/calculation/calculatePCA_dir.ts; formatter rawStatisticsDIRToInterpretation.ts. Inputs are rounded to 0.1 deg there.',
    focus: 'What exactly this mode computes (a great-circle / plane fit through unit vectors = minimum-eigenvector pole? or the principal axis?) and what it shows (pole dec/inc, MAD?). Is pmag.doprinc the right oracle (check what it returns in 4.3.14: principal eigenvector, tau1..3, V2/V3 directions; any MAD?), or is pmag.domean(DE-BFP) on unit vectors, or another function, better? Does PMTools centre the data or use the orientation matrix through the origin (doprinc uses T = sum x x^T, not centred)? Sign/hemisphere convention of the reported pole or axis.',
  },
  {
    id: 'PB-05', title: 'VGP, dp/dm, mean pole',
    pmtoolsCell: 'VGP, dp/dm, mean pole (calculateVGP, calculateButlerParameters)', oracleCell: 'pmag.dia_vgp, pmag.fisher_mean on poles', status: 'todo',
    hints: 'src/utils/statistics/calculation/calculateVGP.ts, src/utils/statistics/calculation/calculateButlerParameters.ts (ledger SCI-20 claims it is dead code reachable only through calculateCutoff: verify), src/utils/graphs/siteToVGP.ts, src/utils/graphs/formatters/stereo/dataToStereoVGP.ts, VGP UI under src/components/AppLogic/VGP and src/components/AppGraphs, dirPage slice (vgpData). Site lat/lon come from the Sites file (CSV/XLSX).',
    focus: 'Pole latitude/longitude formula; dp/dm formula (dp = a95(1+3cos^2 p)/2, dm = a95 sin p / cos I, p = paleocolatitude) and which a95 and inclination feed it; longitude range normalisation; which hemisphere the pole is reported in (does PMTools flip south poles north?); paleolatitude. Mean pole: how PMTools averages VGPs (Fisher on pole lon/lat? polarity flips?) and which statistics it shows (A95, K, N, ...). Compare pmag.dia_vgp, ipmag.vgp_calc, pmag.vgp_di, pmag.fisher_mean on [lon, lat] pairs, ipmag.fisher_mean; any PmagPy equivalent of the Butler parameters if they turn out to be live.',
  },
  {
    id: 'PB-06', title: 'Inclination-only mean',
    pmtoolsCell: 'Inclination-only mean (calculateMCFaddenIncMean)', oracleCell: 'pmag.doincfish', status: 'todo',
    hints: 'src/utils/statistics/calculation/calculateMCFaddenIncMean.ts. Ledger item SCI-20 (deletion approved) says it is dead code. Verify by grepping every importer and checking every UI mode list for an inclination-only option.',
    focus: 'Is it reachable from the UI at all? If dead, say what the row should become. Independently of liveness, compare the method with pmag.doincfish (McFadden and Reid 1982) line by line and numerically (Ivan may keep or delete it). Also check other PmagPy inclination-only functions present in 4.3.14 (grep for "inc" functions, Arason and Levi 2010, ipmag.*inc*).',
  },
  {
    id: 'PB-07', title: 'Lines + great circles combined mean (McFadden and McElhinny 1988)',
    pmtoolsCell: 'Lines + great circles mean (calculateMcFaddenCombineMean)', oracleCell: 'pmag.dolnp (see SCI-23)', status: 'todo',
    hints: 'DIR page mode "mcFad" -> src/utils/statistics/calculation/calculateMcFaddenCombineMean.ts and getRawPlaneData.ts. Ledger SCI-23 (blocked) already reports a mismatch: stratigraphic I = 25.40 PMTools vs 25.04 PmagPy on fixture mcfadden_combine_mean/directions_and_great_circles; spec at test-data/v2.6.6/science-fix-queue-SCI-22-SCI-23.md. Reuse its evidence but re-verify it.',
    focus: 'How a great circle is represented in a PMTools DIR file / interpretation (which field marks a plane; is the stored direction the pole to the plane?) and the exact adapter to pmag.dolnp input (records with dec, inc and direction type; check the exact key names dolnp reads in 4.3.14 and how it splits lines vs planes). Algorithm: McFadden and McElhinny 1988 iterative search for the point on each circle closest to the current mean vs PMTools (single greedy pass per SCI-23?). Statistics: N prime = Nl + Np/2, k and a95 formulas with N prime, R. Which outputs can be compared, expected agreement now (mismatch) and after SCI-23. Directions-only input (no circles): does dolnp reduce to fisher_mean, and does PMTools?',
  },
  {
    id: 'PB-08', title: 'Cutoff 45 deg / Vandamme',
    pmtoolsCell: 'Cutoff 45 deg / Vandamme (find the live code path first, see SCI-20)', oracleCell: 'pmag.dovandamme', status: 'todo',
    hints: 'src/utils/statistics/calculation/calculateCutoff.ts (SCI-20 says dead). The live "cutoff 45" toggle is on the DIR page (a released feature exports "CUT45" in a comment when cutoff 45 is on). Grep for cutoff / Cutoff / CUT45 / vandamme / 45 across src (pages, components, reducers/dirPage, graphs formatters such as stereo/dataToStereoDIR.ts, centerDirectionOnMean.ts, export code). Also look at src/pages/DIRPage/__tests__/Graphs.cutoffResync.test.tsx.',
    focus: 'Find the live cutoff implementation and state exactly: what is cut (VGPs or directions?), the angle measured from which mean (Fisher mean of what; recomputed each iteration?), fixed 45 deg vs Vandamme (1994) variable cutoff A = 1.8*ASD + 5, iterate until nothing exceeds or single pass, what happens to removed points, which statistics are then shown. PmagPy candidates: pmag.dovandamme (inputs/outputs), pmag.scalc_vgp_df and related functions with a cutoff argument (fixed cutoff on VGPs), pmag.get_sb_df, pmag.scalc, ipmag functions with cutoff. Pick the oracle that matches what PMTools actually does; if PMTools cuts directions rather than VGPs, say so plainly and say whether any PmagPy function does that.',
  },
  {
    id: 'PB-09', title: 'Watson tests: randomness, k-ratio, common mean Vw',
    pmtoolsCell: 'Watson tests: randomness, k-ratio, common mean Vw (thesis 1.6-1.11)', oracleCell: 'ipmag.common_mean_watson', status: 'todo',
    hints: 'Thesis section 1.4.1 (thesis.txt ~375-500) defines these tests; "1.6-1.11" are presumably equation numbers there: check. Find where PMTools computes each (grep Watson, random, Vw, ratio, critical, F-distribution etc.): candidates src/utils/statistics/PMTests/** (conglomerate, reversal tests), bootstrapManipulations.ts, calculateBasicStatisticalParameters.ts, src/utils/graphs/formatters/getCDF.ts, src/utils/graphs/classes/Distribution.ts.',
    focus: 'For each of the three tests: is it implemented in PMTools, where, and is it live (shown in the UI)? Randomness test (Watson 1956: R vs R0), k-ratio / precision-ratio test (F-test with 2(N1-1), 2(N2-1) dof), common-mean Vw test (Watson 1983 with Monte Carlo critical value, McFadden and McElhinny 1990). PmagPy candidates: ipmag.common_mean_watson (what it returns; random parts), pmag.vfunc, pmag.watsons_f, pmag.vclose, pmag.fcalc, ipmag.conglomerate_test_Watson, anything else you find by grep. Separate deterministic statistics (exactly comparable) from simulated critical values (statistically comparable only). If this row duplicates parts of PB-10 or PB-12, say so and propose a clean split.',
  },
  {
    id: 'PB-10', title: 'Reversal tests',
    pmtoolsCell: 'Reversal tests: classic and bootstrap', oracleCell: 'ipmag.reversal_test_MM1990, ipmag.reversal_test_bootstrap', status: 'todo',
    hints: 'src/utils/statistics/PMTests/ReversalTest/reversalTestClassic.tsx, reversalTestBootstrap.tsx, reversalTestOldFashioned.tsx (+ __tests__), src/utils/graphs/formatters/reversalTest/dataToReversalTest.ts, src/utils/statistics/bootstrapManipulations.ts, src/utils/graphs/formatters/getCDF.ts; UI in src/components/AppGraphs/ReversalTest and the tests modal. Thesis lists classic McFadden and McElhinny 1990 with manual input, classic computed automatically, bootstrap (thesis.txt ~1100-1115, sections 1.4.2 and 1.5).',
    focus: 'Enumerate every reversal-test variant the UI offers and map each separately. MM1990: gamma (angle between the two means after flipping one polarity), gamma_c (critical angle from Monte Carlo simulation) and the A/B/C/indeterminate classification thresholds (5, 10, 20 deg). What PMTools computes deterministically vs by simulation, and how many iterations. What ipmag.reversal_test_MM1990 returns in 4.3.14 (check return values, prints, plots, arguments), and ipmag.reversal_test_bootstrap (Tauxe 1991 Cartesian bootstrap; does it return numbers or only plot?). Manual-input variant: is there a PmagPy function taking summary statistics (N, k, mean) instead of raw directions? Old-fashioned variant: what it is and its PmagPy equivalent. State what can be parity-tested exactly (e.g. gamma, the Watson V statistic) and what only statistically.',
  },
  {
    id: 'PB-11', title: 'Fold test',
    pmtoolsCell: 'Fold test: classic and bootstrap', oracleCell: 'ipmag.bootstrap_fold_test', status: 'core done (SCI-01)',
    hints: 'src/utils/statistics/PMTests/FoldTest/foldTestBootstrap.ts (exports findBed, unfold), foldTestClassic.ts (8 lines), src/utils/graphs/formatters/foldTest/dataToFoldTest.ts; tests src/utils/statistics/PMTests/FoldTest/__tests__/*.test.ts; generator scripts/gen_foldtest.py; fixtures src/__tests__/fixtures/computations/fold_unfold/. SCI-01 (merged PR #54) fixed the unfolding axis.',
    focus: 'Is there a live "classic" fold test (McElhinny 1964 k-ratio, McFadden 1990 xi, Enkin DC test?) or is foldTestClassic.ts a stub? Bootstrap test: what is deterministic (untilting by percentage, tau1 of the orientation matrix, the untilting grid range and step), what is random (pseudo-samples, count), what PMTools reports (best untilting %, 95% bounds?) vs what ipmag.bootstrap_fold_test does in 4.3.14 (arguments, untilting range, numbers returned vs only plotted/printed). Verify precisely what "core done (SCI-01)" covers and what still needs a PB PR. Explain how PMTools obtains bedding (findBed derives it from geo vs strat directions?) and whether PmagPy has that step or needs bedding as input.',
  },
  {
    id: 'PB-12', title: 'Conglomerate test',
    pmtoolsCell: 'Conglomerate test', oracleCell: 'Watson 1956 randomness, thesis section 1.4.1', status: 'todo',
    hints: 'src/utils/statistics/PMTests/ConglomeratesTest/conglomeratesTest.ts; UI in the tests modal (DIR page). Thesis sections 1.4.1 and 1.4.2 (thesis.txt ~375-560).',
    focus: 'Exactly which statistic and critical value PMTools uses (R vs R0; R0 from the Watson 1956 table, an interpolation, or the approximation R0 = sqrt(7.815 N / 3) for 95%; N range; significance level). Does PmagPy 4.3.14 have an equivalent (grep conglomerate, Watson, random, R0 in ipmag.py and pmag.py)? If yes, compare line by line and numerically; if not, name the exact external reference to test against (e.g. Watson 1956 table values) and give the numbers.',
  },
]

const RUN = {
  type: 'object',
  properties: {
    case: { type: 'string' },
    inputs: { type: 'string' },
    pmtools_result: { type: 'string' },
    pmagpy_result: { type: 'string' },
    max_abs_diff: { type: 'string' },
    agrees: { type: 'boolean' },
    notes: { type: 'string' },
  },
  required: ['case', 'inputs', 'pmtools_result', 'pmagpy_result', 'agrees'],
}

const MAPPING_PROPS = {
  row_id: { type: 'string' },
  pmtools_live_path: { type: 'array', items: { type: 'object', properties: { function: { type: 'string' }, file_line: { type: 'string' }, role: { type: 'string' }, live: { type: 'boolean' } }, required: ['function', 'file_line', 'role', 'live'] } },
  pmtools_method: { type: 'string', description: 'Exactly what PMTools computes: formula, inputs, units, conventions, preprocessing, constants, iteration, randomness.' },
  pmtools_outputs_shown: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, meaning: { type: 'string' }, where_shown: { type: 'string' } }, required: ['name', 'meaning'] } },
  thesis_agreement: { type: 'string', description: 'Does the code match the thesis description? cite thesis.txt lines.' },
  pmagpy_oracles: { type: 'array', items: { type: 'object', properties: { qualified_name: { type: 'string' }, file_line: { type: 'string' }, signature: { type: 'string' }, input_format: { type: 'string' }, outputs: { type: 'string' }, method: { type: 'string' }, deterministic: { type: 'boolean' }, role: { type: 'string', description: 'primary / secondary / partial / helper' } }, required: ['qualified_name', 'file_line', 'signature', 'input_format', 'outputs', 'method', 'deterministic', 'role'] } },
  pmagpy_rejected_candidates: { type: 'array', items: { type: 'object', properties: { qualified_name: { type: 'string' }, reason: { type: 'string' } }, required: ['qualified_name', 'reason'] } },
  verdict: { type: 'string', enum: ['exact', 'exact-with-adapter', 'partial', 'different-method', 'no-pmagpy-equivalent', 'pmtools-code-dead', 'mixed'] },
  verdict_explanation: { type: 'string' },
  output_mapping: { type: 'array', items: { type: 'object', properties: { pmtools_output: { type: 'string' }, pmagpy_output: { type: 'string' }, expected_agreement: { type: 'string', enum: ['bit-exact', 'float-noise', 'input-rounding', 'statistical-only', 'not-comparable', 'mismatch'] }, notes: { type: 'string' } }, required: ['pmtools_output', 'pmagpy_output', 'expected_agreement'] } },
  adapters_required: { type: 'array', items: { type: 'string' } },
  convention_differences: { type: 'array', items: { type: 'string' } },
  empirical_runs: { type: 'array', items: RUN },
  mismatches: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, evidence: { type: 'string' }, cause_file_line: { type: 'string' }, known_item: { type: 'string', description: 'SCI-nn if already catalogued, else "new"' } }, required: ['description', 'evidence', 'known_item'] } },
  proposed_rows: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, pmtools_cell: { type: 'string' }, oracle_cell: { type: 'string' }, status_cell: { type: 'string' }, why: { type: 'string' } }, required: ['id', 'pmtools_cell', 'oracle_cell', 'status_cell', 'why'] } },
  open_questions: { type: 'array', items: { type: 'string' } },
  confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  confidence_reason: { type: 'string' },
  scratch_cleaned: { type: 'boolean' },
}
const MAPPING_REQUIRED = ['row_id', 'pmtools_live_path', 'pmtools_method', 'pmtools_outputs_shown', 'pmagpy_oracles', 'pmagpy_rejected_candidates', 'verdict', 'verdict_explanation', 'output_mapping', 'adapters_required', 'convention_differences', 'empirical_runs', 'mismatches', 'proposed_rows', 'open_questions', 'confidence', 'confidence_reason', 'scratch_cleaned']
const MAPPING_SCHEMA = { type: 'object', properties: MAPPING_PROPS, required: MAPPING_REQUIRED }

const ADJ_SCHEMA = {
  type: 'object',
  properties: Object.assign({}, MAPPING_PROPS, {
    disputes_resolved: { type: 'array', items: { type: 'object', properties: { point: { type: 'string' }, resolution: { type: 'string' }, evidence: { type: 'string' } }, required: ['point', 'resolution', 'evidence'] } },
  }),
  required: MAPPING_REQUIRED.concat(['disputes_resolved']),
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    claims: { type: 'array', items: { type: 'object', properties: { claim: { type: 'string' }, verdict: { type: 'string', enum: ['confirmed', 'refuted', 'partly-wrong', 'unverifiable'] }, evidence: { type: 'string' }, correction: { type: 'string' } }, required: ['claim', 'verdict', 'evidence'] } },
    missed: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, evidence: { type: 'string' }, impact: { type: 'string' } }, required: ['what', 'evidence'] } },
    empirical_runs: { type: 'array', items: RUN },
    overall: { type: 'string', enum: ['mapping-correct', 'correct-with-minor-corrections', 'materially-wrong'] },
    summary: { type: 'string' },
    scratch_cleaned: { type: 'boolean' },
  },
  required: ['lens', 'claims', 'missed', 'empirical_runs', 'overall', 'summary', 'scratch_cleaned'],
}

const INVENTORY_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: { shown_where: { type: 'string' }, quantity: { type: 'string' }, source_function: { type: 'string' }, file_line: { type: 'string' }, live: { type: 'boolean' }, covered_by_row: { type: 'string', description: 'PB-xx, or "none"' }, candidate_pmagpy: { type: 'string' }, notes: { type: 'string' } }, required: ['shown_where', 'quantity', 'source_function', 'file_line', 'live', 'covered_by_row'] } },
    table_name_checks: { type: 'array', items: { type: 'object', properties: { row: { type: 'string' }, name_in_table: { type: 'string' }, exists: { type: 'boolean' }, actual: { type: 'string' } }, required: ['row', 'name_in_table', 'exists'] } },
    dead_code: { type: 'array', items: { type: 'object', properties: { function: { type: 'string' }, file_line: { type: 'string' }, evidence: { type: 'string' } }, required: ['function', 'file_line', 'evidence'] } },
    summary: { type: 'string' },
  },
  required: ['items', 'table_name_checks', 'dead_code', 'summary'],
}

const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    gaps: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['uncovered-computation', 'unverified-claim', 'contradiction-between-rows', 'row-split-needed', 'plan-rule-issue', 'other'] }, description: { type: 'string' }, rows: { type: 'array', items: { type: 'string' } }, evidence: { type: 'string' }, suggested_action: { type: 'string' } }, required: ['kind', 'description', 'evidence', 'suggested_action'] } },
    summary: { type: 'string' },
  },
  required: ['gaps', 'summary'],
}

const AGENT_OPTS = { model: 'fable', effort: 'xhigh' }

const mapPrompt = (row) => `${COMMON(row.id + '-map')}
YOUR ROW: ${row.id} - ${row.title}
As written in the table: PMTools cell = "${row.pmtoolsCell}"; proposed oracle = "${row.oracleCell}"; status = "${row.status}".
Starting pointers (not conclusions; verify them): ${row.hints}
Focus points: ${row.focus}

DO ALL OF THE FOLLOWING
1. PMTools side. Trace the LIVE code path from the UI control the user clicks down to the math, citing file:line at each hop. Say which functions are live (reachable from the UI) and which are dead (grep for importers). List every number the UI shows for this computation and where it comes from. State exactly what is computed: formula, inputs, units, angle conventions, preprocessing (rounding, polarity flips, normalisation, coordinate frame), constants, iteration/termination, randomness. Compare with the thesis where it describes the method (cite thesis.txt lines).
2. PmagPy side. Read the source of the proposed oracle(s) in 4.3.14 (cite lines): signature, input format, meaning of each output, formula, conventions, randomness, whether it returns values or only prints/plots. Then grep pmag.py and ipmag.py (method names, authors, keywords) for every other candidate oracle and say why each is better or worse. If PmagPy has no equivalent, say so and name the best non-PmagPy reference (thesis formula, published table) instead.
3. Compare precisely: for each PMTools output, which PmagPy output (if any) it should equal, the exact input adapter needed (e.g. strike -> dip direction, hade -> plunge, plane -> pole, polarity flip, unit vectors, key names), and the expected agreement (bit-exact / float-noise / input-rounding / statistical-only / not-comparable / mismatch).
4. Run both on identical inputs (scratch Jest + Python): at least one realistic case (a real file from src/assets/examples/ or test-data/, or an existing fixture) plus the edge cases relevant to this row (N=1, N=2, antipodal pairs, vertical directions/poles, vertical and overturned beds, declination wrap at 0/360, whichever apply). Report actual numbers and the max abs difference. If a part is random, run the deterministic core and say exactly what is random.
5. Record every mismatch (do not fix), with evidence and the responsible line on each side; say whether it is a known SCI item.
6. Propose the corrected table row(s). Split the row when one oracle cannot cover it (e.g. several methods behind one row). Status values: todo / mismatch-known / no-pmagpy-oracle / dead-code / core done.
7. Open questions only where a human decision is genuinely needed; Ivan is no longer a paleomagnetist, so phrase each as one plain sentence with the options.
Return the structured result.`

const sourceVerifyPrompt = (row, mapping) => `${COMMON(row.id + '-src')}
You are an ADVERSARIAL SOURCE REVIEWER for row ${row.id} (${row.title}). Another agent produced the mapping below. Refute it wherever it is wrong by independently re-reading both code bases: open every cited file:line yourself, do not trust its citations or summaries.
Check every claim: function names and file:line exist and say what is claimed; the PMTools path called live is really reachable from the UI and dead code is really dead (grep importers); conventions are right (units, dec/inc vs Cartesian axes, dip direction vs strike, right-hand rule, hade vs plunge, polarity, coordinate frame); formulas and constants are right (N vs N-1, exact vs approximate a95, iteration rules, critical values); the output mapping is right; the verdict category is right.
Then hunt for what it missed: other PmagPy 4.3.14 functions in pmag.py / ipmag.py that would be a better or additional oracle (grep widely, not just the names already mentioned), other live PMTools code paths or displayed numbers for this computation, adapters it forgot, returns that are actually prints/plots. Default to "refuted" or "unverifiable" when a claim cannot be supported from source. You may run code to settle a point.

MAPPING UNDER REVIEW (JSON):
${JSON.stringify(mapping, null, 1)}`

const empiricalVerifyPrompt = (row, mapping) => `${COMMON(row.id + '-emp')}
You are an ADVERSARIAL TESTER for row ${row.id} (${row.title}). Another agent produced the mapping below. Independently construct YOUR OWN inputs (different from those it used), run the PMTools code (scratch Jest) and the claimed PmagPy oracle with the claimed adapters, and try to break every agreement claim and every mismatch claim.
- Where it says outputs agree: look for inputs where they do not (wrap-around at 0/360, hemisphere and sign, N=1/N=2, degenerate and antipodal sets, near-vertical directions, vertical/overturned beds, large dispersion, rounding to 0.1 deg).
- Where it reports a mismatch: reproduce it and pin the exact cause (which line on which side).
- Where it says "no PmagPy equivalent" or rejects a candidate: try the closest PmagPy candidates numerically anyway.
- Where an adapter is claimed: test that the adapter is exactly right, not just approximately (e.g. off-by-90, strike vs dip direction, sign of plunge).
Report every run with actual numbers.

MAPPING UNDER REVIEW (JSON):
${JSON.stringify(mapping, null, 1)}`

const adjudicatePrompt = (row, mapping, verifications) => `${COMMON(row.id + '-adj')}
You are the ADJUDICATOR for row ${row.id} (${row.title}). Below are an initial mapping and two adversarial reviews (a source reviewer and an empirical tester) that dispute parts of it. Produce the FINAL, corrected mapping for this row. For every disputed or missed point, decide with evidence: open the code yourself and re-run whatever is in doubt (scratch Jest + Python). Do not average opinions; settle facts. Keep everything from the mapping that survived review, fix what was refuted, add what was missed. Record each resolution in disputes_resolved.

INITIAL MAPPING (JSON):
${JSON.stringify(mapping, null, 1)}

SOURCE REVIEW (JSON):
${JSON.stringify(verifications[0], null, 1)}

EMPIRICAL REVIEW (JSON):
${JSON.stringify(verifications[1], null, 1)}`

const inventoryPrompt = `${COMMON('inventory')}
YOUR TASK: completeness inventory for the Part B table. The current table rows are:
${ROWS.map(r => `- ${r.id}: ${r.pmtoolsCell} | oracle: ${r.oracleCell} | status: ${r.status}`).join('\n')}
1. Enumerate every computed quantity PMTools shows to the user or writes into an export: PCA page (statistics modes, Zijderveld projections, stereo plots, intensity/demagnetization curve and its normalisation, interpretation table), DIR page (statistics modes, stereo plots, confidence circles/ellipses, cutoff, reversal-of-polarity flips, centered export rotation, VGP table/plot/mean pole), every test modal (fold, reversal, conglomerate, any others), and every export that contains computed numbers. Trace each to its source function (file:line) and say whether it is live (reachable from the UI; grep importers up to a page/component).
2. For each, say which PB row covers it, or "none". For the uncovered ones name a candidate PmagPy 4.3.14 function if one exists (open pmag.py/ipmag.py to confirm it exists and does that), or say none. Purely graphical transforms (pixel scaling) can be grouped, but projection math (equal-area projection, Zijderveld axis choice, great-circle drawing, confidence-ellipse construction) counts as a computation.
3. Check that every function name written in the table exists with that name (e.g. "Coordinates.correctBedding", "calculateMCFaddenIncMean", "calculateButlerParameters") and give the actual name if not.
4. List dead statistics code (no production importer), with grep evidence.
Return the structured result.`

const criticPrompt = (finals, inventory) => `${COMMON('critic')}
You are the COMPLETENESS CRITIC for the Part B computations table review. Below are the final per-row mappings (after adversarial review and adjudication) and an inventory of every computed quantity PMTools shows. Find what is still wrong or missing:
- computations shown to users that no row covers;
- claims in the rows that remain unverified or rest on a single unchecked citation (spot-check the most consequential ones yourself in the source);
- contradictions between rows (e.g. two rows describing the same PMTools function differently, the same PmagPy function with different conventions, overlapping rows such as Watson tests vs reversal/conglomerate tests);
- rows that should be split or merged, and ordering problems (dependencies between rows);
- problems with the plan rules as they apply to these oracles (e.g. tolerance rule vs inputs PMTools rounds to 0.1 deg, bootstrap rows that cannot have exact parity, PmagPy functions that only plot/print, version pin 4.3.14).
Be concrete; give evidence for each gap.

FINAL ROW MAPPINGS (JSON):
${JSON.stringify(finals, null, 1)}

INVENTORY (JSON):
${JSON.stringify(inventory, null, 1)}`

log('Launching 12 row mappers and the completeness inventory in parallel')

phase('Inventory')
const inventoryPromise = agent(inventoryPrompt, Object.assign({ label: 'inventory', phase: 'Inventory', schema: INVENTORY_SCHEMA }, AGENT_OPTS))

const results = await pipeline(
  ROWS,
  (row) => agent(mapPrompt(row), Object.assign({ label: 'map:' + row.id, phase: 'Map', schema: MAPPING_SCHEMA }, AGENT_OPTS)),
  async (mapping, row) => {
    if (!mapping) return { row: row.id, mapping: null, verifications: [], final: null, adjudicated: false, error: 'mapper failed' }
    const verifications = await parallel([
      () => agent(sourceVerifyPrompt(row, mapping), Object.assign({ label: 'verify-src:' + row.id, phase: 'Verify', schema: VERIFY_SCHEMA }, AGENT_OPTS)),
      () => agent(empiricalVerifyPrompt(row, mapping), Object.assign({ label: 'verify-emp:' + row.id, phase: 'Verify', schema: VERIFY_SCHEMA }, AGENT_OPTS)),
    ])
    return { row: row.id, mapping, verifications }
  },
  async (state, row) => {
    if (!state || !state.mapping) return state
    const v = state.verifications
    const clean = v.length === 2 && v.every(x => x && x.overall === 'mapping-correct' && x.missed.length === 0 && x.claims.every(c => c.verdict === 'confirmed'))
    if (clean) {
      log(row.id + ': both reviewers confirmed the mapping, no adjudication')
      return Object.assign({}, state, { final: state.mapping, adjudicated: false })
    }
    const final = await agent(adjudicatePrompt(row, state.mapping, [v[0] || { note: 'source reviewer failed' }, v[1] || { note: 'empirical reviewer failed' }]), Object.assign({ label: 'adjudicate:' + row.id, phase: 'Adjudicate', schema: ADJ_SCHEMA }, AGENT_OPTS))
    log(row.id + ': adjudicated' + (final ? ' (verdict ' + final.verdict + ')' : ' (adjudicator failed, keeping mapping)'))
    return Object.assign({}, state, { final: final || state.mapping, adjudicated: !!final })
  },
)

const inventory = await inventoryPromise

phase('Critic')
const finals = results.filter(Boolean).map(r => r.final).filter(Boolean)
const critic = await agent(criticPrompt(finals, inventory), Object.assign({ label: 'critic', phase: 'Critic', schema: CRITIC_SCHEMA }, AGENT_OPTS))

return { rows: results, inventory, critic }
