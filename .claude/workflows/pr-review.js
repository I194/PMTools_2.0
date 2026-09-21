export const meta = {
  name: 'pr-review',
  description:
    'Review a branch against dev on PMTools-specific dimensions (correctness, conventions, tests, science when relevant), then adversarially verify every finding',
  whenToUse:
    'Before opening or merging a PR to dev. args: { base: "dev", head: "HEAD" } are the defaults. Complements the built-in /code-review with the project rules and a science lens.',
  phases: [
    { title: 'Scope', detail: 'changed files; does the diff touch science paths?' },
    { title: 'Review', detail: 'one reviewer per dimension' },
    { title: 'Verify', detail: 'three refuters per deduplicated finding' },
  ],
}

const base = (args && args.base) || 'dev'
const head = (args && args.head) || 'HEAD'
const range = `${base}...${head}`

const SCOPE_SCHEMA = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    commits: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'summary', 'commits'],
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'integer' },
          severity: { type: 'string', enum: ['critical', 'major', 'minor', 'nit'] },
          description: { type: 'string' },
          failureScenario: { type: 'string', description: 'concrete input or state that shows the problem' },
          suggestedFix: { type: 'string' },
        },
        required: ['title', 'file', 'line', 'severity', 'description', 'failureScenario'],
      },
    },
  },
  required: ['dimension', 'findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    reasoning: { type: 'string' },
  },
  required: ['refuted', 'confidence', 'reasoning'],
}

phase('Scope')
const scope = await agent(
  `In the PMTools repository run, read-only: git log --oneline ${range}; git diff --stat ${range}; git diff --name-only ${range}. Return the changed file list (repo-relative paths), the commit subjects, and a two-sentence summary of what the branch does.`,
  { label: 'scope', schema: SCOPE_SCHEMA, effort: 'low' },
)
if (!scope || !scope.files.length) return { base, head, confirmed: [], rejected: [], note: 'no changes in range' }
log(`${scope.files.length} changed files: ${scope.summary}`)

const touchesScience = scope.files.some(
  (file) => /^src\/utils\/(statistics|files)\//.test(file) || /\.expected\.json$/.test(file),
)
const touchesUi = scope.files.some((file) => /^src\/(components|pages|App)\/.*\.(tsx|scss)$/.test(file))

const shared = `Review branch range ${range} of PMTools. Read-only: use git diff ${range} -- <file>, git show, and the surrounding code. Report only real problems with a concrete failure scenario; skip style opinions the tooling already enforces. Anchor every finding to a repo-relative path and a line in the NEW version of the file.`

const DIMENSIONS = [
  {
    key: 'correctness',
    prompt: `${shared}
Dimension: CORRECTNESS. Logic errors, wrong edge cases (empty arrays, index 0 guards like "if (index)", N = 1, NaN/Infinity propagation), state that is not reset when the current file changes, non-serializable values in Redux, stale memoization keys, React 17 constraints (no createRoot, no automatic batching), i18n keys missing from one of public/locales/{ru,en}.`,
  },
  {
    key: 'conventions',
    prompt: `${shared}
Dimension: PROJECT CONVENTIONS (CLAUDE.md). Full descriptive identifiers (no r, e, tmp, tol, i; domain names like Dgeo, Igeo, a95, MAD, k are fine); no console.log; SCSS modules for styling; PascalCase components, camelCase utilities; no new @mui imports in new components once src/ui-kit/ exists and no @mui/@radix imports outside src/ui-kit/; no Tailwind, no TanStack, no DataGrid libraries; commit subjects lowercase imperative; no scientific-logic change hidden inside a refactor or "perf" commit.`,
  },
  {
    key: 'tests',
    prompt: `${shared}
Dimension: TESTS AND REFERENCES. New logic has a test; a science fix flips exactly the locked references it should (src/__tests__/fixtures/**/*.expected.json) and the PR text/commit explains the new numbers; no reference regenerated without justification; fixtures use the shared harness in src/test-utils/ (describeParserReferenceOutput, computation/converter helpers) rather than hand-written loops; no test only passes on one platform (trig floats are rounded to 7 significant figures by the harness).`,
  },
]
if (touchesScience) {
  DIMENSIONS.push({
    key: 'science',
    agentType: 'science-reviewer',
    prompt: `${shared}
Dimension: SCIENTIFIC CORRECTNESS. Apply your full checklist (thesis conformance, PmagPy cross-check, units and conventions, degenerate inputs, reference-flip discipline).`,
  })
}
if (touchesUi) {
  DIMENSIONS.push({
    key: 'ui',
    prompt: `${shared}
Dimension: UI AND THEMING. Hardcoded colors instead of theme/tokens, dark-mode regressions, layout that breaks at 1280x720, missing user feedback on actions, hotkeys firing inside text inputs, user-visible strings not going through i18next.`,
  })
}
log(`Dimensions: ${DIMENSIONS.map((dimension) => dimension.key).join(', ')}`)

phase('Review')
const reviews = await parallel(
  DIMENSIONS.map((dimension) => () => {
    const options = { label: `review:${dimension.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }
    if (dimension.agentType) options.agentType = dimension.agentType
    return agent(dimension.prompt, options)
  }),
)
const rawFindings = reviews
  .filter(Boolean)
  .flatMap((review) => review.findings.map((finding) => ({ ...finding, dimension: review.dimension })))

// Barrier is justified here: the same defect is often reported by two dimensions.
const byLocation = new Map()
for (const finding of rawFindings) {
  const key = `${finding.file}:${finding.line}`
  const existing = byLocation.get(key)
  if (existing) existing.dimensions.push(finding.dimension)
  else byLocation.set(key, { ...finding, dimensions: [finding.dimension] })
}
const deduped = Array.from(byLocation.values())
log(`${rawFindings.length} raw findings, ${deduped.length} after dedup`)
if (!deduped.length) return { base, head, summary: scope.summary, confirmed: [], rejected: [] }

const REFUTE_LENSES = [
  { key: 'reproduce', prompt: 'Try to show the failure scenario does NOT happen: trace the actual inputs that can reach this line.' },
  { key: 'counter', prompt: 'Try to show the finding is already handled elsewhere (guard, caller, test, hook) or is by design per CLAUDE.md or the roadmap notes.' },
  { key: 'severity', prompt: 'Accept the mechanism but try to show the severity is overstated or the suggested fix would be wrong or worse.' },
]

const verified = await pipeline(deduped, (finding) =>
  parallel(
    REFUTE_LENSES.map((lens) => () =>
      agent(
        `Adversarially verify this code-review finding for range ${range}. Lens: ${lens.key}. ${lens.prompt}
Default to refuted=true if you cannot confirm the problem yourself in the code. Read-only.
Finding:
${JSON.stringify(finding, null, 2)}`,
        { label: `verify:${finding.file.split('/').pop()}:${finding.line}:${lens.key}`, phase: 'Verify', schema: VERDICT_SCHEMA },
      ),
    ),
  ).then((votes) => {
    const cleanVotes = votes.filter(Boolean)
    const refutations = cleanVotes.filter((vote) => vote.refuted).length
    return { ...finding, votes: cleanVotes, refutations, confirmed: refutations < 2 }
  }),
)

const rank = { critical: 0, major: 1, minor: 2, nit: 3 }
const settled = verified.filter(Boolean)
const confirmed = settled.filter((finding) => finding.confirmed).sort((a, b) => rank[a.severity] - rank[b.severity])
const rejected = settled.filter((finding) => !finding.confirmed)
log(`${confirmed.length} confirmed, ${rejected.length} refuted`)

return { base, head, summary: scope.summary, files: scope.files, confirmed, rejected }
