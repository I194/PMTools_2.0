export const meta = {
  name: 'investigate-found-bugs',
  description:
    'Investigate found-bugs-todo entries in parallel (read-only), adversarially verify each fix spec, write a ranked science-fix queue',
  whenToUse:
    'Before starting science-fix PRs or whenever found-bugs-todo.md grows. args: ["SCI-01", "SCI-02"] limits the scope; no args = every item in the catalog below.',
  phases: [
    { title: 'Investigate', detail: 'one read-only bug-investigator per item' },
    { title: 'Verify', detail: 'three science-reviewer lenses per spec, each trying to refute it' },
    { title: 'Rank', detail: 'one ranking pass; writes test-data/v{version}/science-fix-queue.md' },
  ],
}

// Mirrors the science-fixes track in .claude/progress.json. Keep the ids in sync.
// Titles are hints only: the investigator reads the full bullet in found-bugs-todo.md itself.
const CATALOG = [
  { id: 'SCI-01', title: 'Fold test unfolds about the wrong axis (findBed returns a dip direction, correctBedding expects a strike)', section: 'Surfaced in Layer A' },
  { id: 'SCI-02', title: 'parserPMD drops 3-digit degC steps (4-char step column overflow)', section: 'Surfaced in parserPMD reference output' },
  { id: 'SCI-03', title: 'calculateCutoff never resets cutoffValue between iterations', section: 'Surfaced in PR 5' },
  { id: 'SCI-04', title: 'calculateCutoff skips an outlier sitting at index 0', section: 'Surfaced in PR 5' },
  { id: 'SCI-05', title: 'Distribution.R stuck at 0 so butlerDistribution is always null', section: 'Surfaced in PR 5' },
  { id: 'SCI-06', title: 'calculateButlerParameters mixes degrees and radians', section: 'Surfaced in PR 5' },
  { id: 'SCI-07', title: 'calculateMCFaddenIncMean hardcodes the F-distribution term to 0', section: 'Surfaced in PR 6' },
  { id: 'SCI-08', title: 'calculateMCFaddenIncMean crashes for a single inclination (N = 1)', section: 'Surfaced in PR 6' },
  { id: 'SCI-09', title: 'calculatePCA_dir no-op mirroring line and dead code copied from PCA_pmd', section: 'Surfaced in PR 6' },
  { id: 'SCI-10', title: 'CSV converters do not quote fields containing commas', section: 'Surfaced in PR 4' },
  { id: 'SCI-11', title: 'toPMM hardcodes author/date and mislabels the a95g/a95s columns', section: 'Surfaced in PR 4' },
  { id: 'SCI-12', title: 'toGPML download uses the text/csv MIME type', section: 'Surfaced in PR 4' },
  { id: 'SCI-13', title: 'toPMD truncates the specimen name to 10 chars and merges it with a=', section: 'Surfaced in PR 4' },
  { id: 'SCI-14', title: 'parserPMD validation.invalidRows rowNumber is off by one', section: 'Surfaced in parserPMD reference output' },
  { id: 'SCI-15', title: 'parserRS3 ISO-8859-1 input decoded as UTF-8 (D2)', section: 'top of the file (D2)' },
  { id: 'SCI-17', title: 'Non-finite direction crashes DIR statistics: McFadden gcPath[-1], GC mode, every mode after the localStorage round trip (follow the "SCI-17 re-investigation brief")', section: 'Surfaced in PR 6' },
  { id: 'SCI-22', title: 'Coordinates.angle takes acos of an unclamped dot product; a direction antipodal to the mean can escape the live CUTOFF 45', section: 'Surfaced by the investigate-found-bugs run' },
  { id: 'SCI-23', title: 'McFadden combined mean (live MCFAD button) is a single greedy pass instead of the iterative procedure; order-dependent, differs from PmagPy', section: 'Surfaced by the investigate-found-bugs run' },
]

const requested = Array.isArray(args) && args.length ? args.map(String) : null
const selected = requested ? CATALOG.filter((bug) => requested.includes(bug.id)) : CATALOG
// A scoped run must not overwrite the full-catalog report.
const reportFileName = requested ? `science-fix-queue-${selected.map((bug) => bug.id).join('-')}.md` : 'science-fix-queue.md'
if (requested) {
  const unknown = requested.filter((id) => !CATALOG.some((bug) => bug.id === id))
  if (unknown.length) log(`Unknown ids ignored (not in the catalog): ${unknown.join(', ')}`)
}
if (!selected.length) return { error: 'nothing selected', catalog: CATALOG.map((bug) => bug.id) }
log(`Investigating ${selected.length} item(s): ${selected.map((bug) => bug.id).join(', ')}`)

const SPEC_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    confirmed: { type: 'boolean', description: 'false if current behavior is actually correct or the note is stale' },
    rootCause: { type: 'string' },
    locations: { type: 'array', items: { type: 'string' }, description: 'path:line entries' },
    evidence: { type: 'array', items: { type: 'string' }, description: 'commands run and what they printed' },
    proposedFix: { type: 'string' },
    referencesToFlip: { type: 'array', items: { type: 'string' }, description: '*.expected.json paths and what should change' },
    testsToAdd: { type: 'array', items: { type: 'string' } },
    blastRadius: { type: 'string' },
    risk: { type: 'string', enum: ['low', 'medium', 'high'] },
    userImpact: { type: 'string', description: 'what a researcher sees today because of this bug' },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'confirmed', 'rootCause', 'locations', 'evidence', 'proposedFix', 'referencesToFlip', 'blastRadius', 'risk', 'userImpact'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    refuted: { type: 'boolean' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    reasoning: { type: 'string' },
    corrections: { type: 'array', items: { type: 'string' }, description: 'what the spec should say instead' },
  },
  required: ['lens', 'refuted', 'confidence', 'reasoning'],
}

const RANK_SCHEMA = {
  type: 'object',
  properties: {
    reportPath: { type: 'string' },
    queue: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          order: { type: 'integer' },
          reason: { type: 'string' },
          dependsOn: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'order', 'reason'],
      },
    },
    needsDecision: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, question: { type: 'string' } },
        required: ['id', 'question'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['reportPath', 'queue', 'needsDecision', 'summary'],
}

const LENSES = [
  {
    key: 'root-cause',
    prompt:
      'Try to refute the ROOT CAUSE: is the cited code really the origin of the behavior? Could another line, caller, or data path explain the same symptom? Re-run the reproduction yourself.',
  },
  {
    key: 'fix',
    prompt:
      'Try to refute the PROPOSED FIX: would it change behavior elsewhere, flip a locked reference for a legitimate reason, or leave the bug in place for another input? Check every caller.',
  },
  {
    key: 'science',
    prompt:
      'Try to refute the SCIENCE: check the formula or convention against the thesis PDF (pdftotext -layout src/assets/PMTools_how_to_use.pdf) and PmagPy (python3, pmagpy is installed). Is the claimed "correct" behavior actually correct?',
  },
]

const investigatePrompt = (bug) => `You are investigating ledger item ${bug.id}: "${bug.title}".
Start by reading the matching bullet in .claude/development-roadmap/notes/found-bugs-todo.md (section "${bug.section}") and the entry in .claude/progress.json.
Then follow your method: reproduce with the locked fixture or a minimal input; localize to path:line; where a formula or convention is involved, cross-check against the thesis PDF and PmagPy; scope the fix and list every *.expected.json that would flip and what the new numbers should be.
Set confirmed=false if current behavior turns out to be correct or the note is stale, and say why.
Be concrete: numbers, paths, commands and their output. Read-only: never edit files.`

const verifyPrompt = (spec, lens) => `Adversarially verify this fix spec for ${spec.id}. Your lens: ${lens.key}. ${lens.prompt}
Default to refuted=true when you cannot confirm the claim yourself from code, fixtures, the thesis, or PmagPy. Quote path:line and the numbers you saw. Read-only.
Spec under review:
${JSON.stringify(spec, null, 2)}`

const rankPrompt = (items) => `Rank these verified science-fix specs for PMTools into an ordered PR queue.
Rules: one fix per PR; researcher impact first (wrong numbers > silent data loss > crashes > cosmetic); cheap independent fixes may go early; respect dependencies (for example Distribution.R before the Butler unit fix); an item with survives=false, confirmed=false, or an unresolved open question goes to needsDecision instead of the queue, with the question Ivan must answer.
Write the result as Markdown to test-data/v{version}/${reportFileName} (read the version from package.json; create the directory if needed). Do not modify any other science-fix-queue*.md file. Per item include: id, title, severity, root cause in one line, references to flip, risk, and the three refuter verdicts with their reasoning. Then return the structured summary.
Data:
${JSON.stringify(items, null, 2)}`

const results = await pipeline(
  selected,
  (bug) =>
    agent(investigatePrompt(bug), {
      label: `investigate:${bug.id}`,
      phase: 'Investigate',
      agentType: 'bug-investigator',
      schema: SPEC_SCHEMA,
    }),
  (spec, bug) => {
    if (!spec) return null
    return parallel(
      LENSES.map((lens) => () =>
        agent(verifyPrompt(spec, lens), {
          label: `verify:${bug.id}:${lens.key}`,
          phase: 'Verify',
          agentType: 'science-reviewer',
          schema: VERDICT_SCHEMA,
        }),
      ),
    ).then((votes) => ({ bug, spec, votes: votes.filter(Boolean) }))
  },
)

const judged = results.filter(Boolean).map((result) => {
  const refutations = result.votes.filter((vote) => vote.refuted).length
  return { ...result, refutations, survives: result.spec.confirmed && refutations < 2 }
})
const dropped = selected.filter((bug) => !judged.some((result) => result.bug.id === bug.id))
if (dropped.length) log(`No result for ${dropped.map((bug) => bug.id).join(', ')} (agent skipped or failed)`)
log(`${judged.filter((result) => result.survives).length}/${judged.length} specs survived adversarial review`)

phase('Rank')
const ranking = await agent(rankPrompt(judged), { label: 'rank', schema: RANK_SCHEMA })

return { ranking, judged, dropped: dropped.map((bug) => bug.id) }
