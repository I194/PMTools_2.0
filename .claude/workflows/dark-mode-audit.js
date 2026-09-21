export const meta = {
  name: 'dark-mode-audit',
  description:
    'Walk every page and modal in dark mode through Playwright, map each defect to its source, and produce a token-level fix plan',
  whenToUse:
    'The dev server must be running on localhost:3000. Run before UIK-03 (tokens) to get the defect baseline and again after each theming PR. args: optional array of {name, route, steps} to replace the default walk.',
  phases: [
    { title: 'Audit', detail: 'one evaluator walks the whole scope; Playwright shares a single browser, so this stage is serial on purpose' },
    { title: 'Map', detail: 'one read-only investigator per defect: source file, selector, hardcoded value, proposed token' },
    { title: 'Plan', detail: 'group the mappings into a token plan; writes test-data/v{version}/dark-mode-audit.md' },
  ],
}

const DEFAULT_SCOPE = [
  { name: 'landing', route: '/', steps: 'Scroll the whole page. Hover navigation links and buttons.' },
  { name: 'why-pmtools', route: '/why-pmtools', steps: 'Scroll the whole page.' },
  { name: 'authors', route: '/authors-and-history', steps: 'Scroll the whole page.' },
  { name: 'pca-empty', route: '/app/pca', steps: 'Empty state before any file is loaded. Open and close the file upload dialog.' },
  {
    name: 'pca-loaded',
    route: '/app/pca',
    steps:
      'Upload test-data/sample.pmd. Select several steps in the table. Run a PCA line fit so an interpretation row exists. Switch geographic/stratigraphic. Open the settings modal and the changelog modal.',
  },
  {
    name: 'dir-loaded',
    route: '/app/dir',
    steps:
      'Upload test-data/sample.dir. Run Fisher statistics. Select directions and reverse polarity on some. Open the VGP modal. Open the fold/reversal test modal if present.',
  },
]
const scope = Array.isArray(args) && args.length ? args : DEFAULT_SCOPE

const DEFECT_KINDS = ['contrast', 'invisible', 'hardcoded-light-color', 'inconsistent', 'layout', 'other']
const SEVERITIES = ['critical', 'major', 'minor', 'cosmetic']

const AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    blocked: { type: 'boolean', description: 'true when the dev server was unreachable or the browser could not start' },
    reason: { type: 'string' },
    reportPath: { type: 'string' },
    defects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'DM-01, DM-02, ...' },
          page: { type: 'string' },
          element: { type: 'string', description: 'role/name or CSS selector' },
          description: { type: 'string' },
          kind: { type: 'string', enum: DEFECT_KINDS },
          severity: { type: 'string', enum: SEVERITIES },
          screenshot: { type: 'string' },
        },
        required: ['id', 'page', 'element', 'description', 'kind', 'severity'],
      },
    },
  },
  required: ['blocked', 'defects'],
}

const MAP_SCHEMA = {
  type: 'object',
  properties: {
    defectId: { type: 'string' },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: { path: { type: 'string' }, line: { type: 'integer' }, snippet: { type: 'string' } },
        required: ['path', 'line'],
      },
    },
    cause: { type: 'string', description: 'why it renders wrong in dark mode' },
    proposedToken: { type: 'string', description: 'CSS custom property name that should own this value' },
    proposedChange: { type: 'string' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
  required: ['defectId', 'sources', 'cause', 'proposedToken', 'proposedChange', 'confidence'],
}

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    reportPath: { type: 'string' },
    tokenPlan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          role: { type: 'string' },
          replaces: { type: 'array', items: { type: 'string' }, description: 'path:line of hardcoded values it absorbs' },
          notes: { type: 'string' },
        },
        required: ['token', 'role', 'replaces'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['reportPath', 'tokenPlan', 'summary'],
}

phase('Audit')
const audit = await agent(
  `Run a dark-mode audit of PMTools on localhost:3000 following your dark-mode audit mode.
Scope, in order:
${scope.map((item, index) => `${index + 1}. ${item.name} (${item.route}): ${item.steps}`).join('\n')}
Save screenshots under test-data/v{version}/dark-mode/ (read the version from package.json) and name them by scope and state. Number defects DM-01, DM-02, ... Write the human report to test-data/v{version}/dark-mode-audit-raw.md and return the structured list. If localhost:3000 is unreachable, return blocked=true with the reason and do not try to start anything other than checking the port.`,
  { label: 'audit', agentType: 'evaluator', schema: AUDIT_SCHEMA },
)

if (!audit) return { blocked: true, reason: 'evaluator returned nothing' }
if (audit.blocked) return { blocked: true, reason: audit.reason }
log(`${audit.defects.length} defects recorded by the evaluator`)
if (!audit.defects.length) return { blocked: false, defects: [], reportPath: audit.reportPath }

const mappings = await pipeline(audit.defects, (defect) =>
  agent(
    `Map this dark-mode defect to its source in the PMTools codebase. Read-only.
Look in the SCSS modules (src/**/*.module.scss), inline sx={{...}} props, hardcoded hex colors in TSX, and the MUI theme in src/App/App.tsx. Name the exact path:line that produces the wrong color/border/background, explain the cause, and propose the CSS custom property that should own the value (naming convention: --color-<role>-<variant>, e.g. --color-text-primary, --color-surface-elevated, --color-border-subtle).
Defect:
${JSON.stringify(defect, null, 2)}`,
    { label: `map:${defect.id}`, phase: 'Map', agentType: 'bug-investigator', schema: MAP_SCHEMA, effort: 'medium' },
  ),
)
const mapped = mappings.filter(Boolean)
log(`${mapped.length}/${audit.defects.length} defects mapped to source`)

phase('Plan')
const plan = await agent(
  `Turn these dark-mode defect mappings into a token plan for the PMTools UI kit (src/ui-kit/tokens, see .claude/development-roadmap/03a-ui-kit.md).
Group defects by the token that fixes them; keep the token set small (roughly 6 colors per role: text, surface, border, accent, status). For each token give the light and dark values you recommend based on the current palette in src/App/App.tsx and the most common hardcoded values (#212121, #000, #119dff, #fff).
Write test-data/v{version}/dark-mode-audit.md (read the version from package.json) with: a summary, a defects table sorted by severity with screenshot links, and the token plan with the path:line each token absorbs. Return the structured plan.
Defects:
${JSON.stringify(audit.defects, null, 2)}
Mappings:
${JSON.stringify(mapped, null, 2)}`,
  { label: 'plan', schema: PLAN_SCHEMA },
)

return { blocked: false, defects: audit.defects, mappings: mapped, plan }
