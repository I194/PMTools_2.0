import { IPmdData } from '../../GlobalTypes';
import { InvalidRowInfo, ParseResult, ParseWarning } from '../validation';

type DemagType = 'thermal' | 'alternating field' | undefined;

/**
 * Infer the demagnetization type for a PMD file by scanning every step name
 * across the file (D3 fix). The previous implementation looked at the first
 * valid step's leading character only — fine for `T100`/`M050`-style files
 * but produced `undefined` for legitimate dialects: bare temperatures with
 * a `°C` suffix (Crimea-style), bare numbers without any letter prefix
 * (Polar Ural-style), and `NRM`-prefixed thermal sequences.
 *
 * Detection priorities:
 *   1. Any step has a thermal marker — literal `°`, the U+FFFD replacement
 *      character left in place by an upstream UTF-8 mis-decode of byte 0xB0
 *      (common for legacy ISO-8859 files), or a digit immediately followed
 *      by a `C`/`c` letter (e.g. `90C`) — → thermal.
 *   2. Any step contains `mT` → alternating field.
 *   3. Any step starts with `T`/`t` (and didn't already match a thermal
 *      marker above) → thermal.
 *   4. Any step starts with `M`/`m` → alternating field.
 *   5. Mixed evidence (both thermal and AF markers) or no evidence at all
 *      (numeric-only step names) → `undefined` (caller emits a warning).
 *
 * `NRM` lines and pure numeric step names are intentionally not counted as
 * either type — they're consistent with both demagnetization protocols.
 */
const THERMAL_MARKER = /°|�|\d[Cc]\b/;
const ALTERNATING_MARKER = /mT/i;

const inferDemagTypeFromStepNames = (stepNames: string[]): DemagType => {
  let thermalEvidence = 0;
  let alternatingEvidence = 0;
  for (const stepName of stepNames) {
    const trimmed = stepName.trim();
    if (THERMAL_MARKER.test(trimmed)) {
      thermalEvidence++;
    } else if (ALTERNATING_MARKER.test(trimmed)) {
      alternatingEvidence++;
    } else if (/^[Tt]/.test(trimmed)) {
      thermalEvidence++;
    } else if (/^[Mm]/.test(trimmed)) {
      alternatingEvidence++;
    }
    // else: trimmed is `NRM`, a bare number, or otherwise neutral — no vote.
  }
  if (thermalEvidence > 0 && alternatingEvidence === 0) return 'thermal';
  if (alternatingEvidence > 0 && thermalEvidence === 0) return 'alternating field';
  return undefined;
};

const AMBIGUOUS_DEMAG_WARNING: ParseWarning = {
  code: 'AMBIGUOUS_DEMAG_TYPE',
  message:
    'PMTools could not infer the demagnetization type from this file. ' +
    'Step names lack a `T`/`M` letter prefix and a `°C`/`mT` unit suffix. ' +
    'The demag column will be empty until the file is re-saved with conventional step names.',
};

/**
 * Process parsing of data from imported .pmd file
 * @param {string} [data] - The string data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {ParseResult<IPmdData>} Parsed data with validation info
 */
const parsePMD = (data: string, name: string): ParseResult<IPmdData> => {
  const eol = /\r\n|\r|\n/;
  // Get all lines except the last one (it's garbage) and the first one (it's empty)
  const lines = data
    .split(eol)
    .slice(1)
    .filter((line) => line.length > 1);

  const headLine = lines[0]; // line with specimen name and orientation params - metadata in other words
  const metadata = {
    name: name, // inner pmd name lay here: headLine.slice(0, 10).trim(),
    a: +headLine.slice(12, 20).trim(),
    b: +headLine.slice(22, 30).trim(),
    s: +headLine.slice(32, 40).trim(),
    d: +headLine.slice(42, 50).trim(),
    v: +headLine.slice(52, headLine.length).trim().toLowerCase().split('m')[0],
  };

  const invalidRows: InvalidRowInfo[] = [];
  let firstValidLine: string | undefined;

  // Pass 1: parse each row; do NOT assign demagType yet (D3 — demagType is now
  // inferred across all rows after parsing, see Pass 2).
  let stepId = 1;
  const stepsWithoutDemagType = lines
    .slice(2)
    .map((line, index) => {
      // PAL | Xc (Am2) | Yc (Am2) | Zc (Am2) | MAG (A/m) | Dg | Ig | Ds | Is| a95
      // PAL === Step (mT or temp degrees)
      // it's old format and we can't just split by " " 'cause it can cause issues
      const step = line.slice(0, 4).trim();
      // Empty strings must become NaN, not 0 (JS quirk: +"" === 0)
      const rawX = line.slice(4, 14).trim();
      const rawY = line.slice(14, 24).trim();
      const rawZ = line.slice(24, 34).trim();
      const rawMag = line.slice(34, 44).trim();
      const rawDgeo = line.slice(44, 50).trim();
      const rawIgeo = line.slice(50, 56).trim();
      const x = rawX === '' ? NaN : +rawX;
      const y = rawY === '' ? NaN : +rawY;
      const z = rawZ === '' ? NaN : +rawZ;
      const mag = rawMag === '' ? NaN : +rawMag;
      const Dgeo = rawDgeo === '' ? NaN : +rawDgeo;
      const Igeo = rawIgeo === '' ? NaN : +rawIgeo;
      const Dstrat = +line.slice(56, 62).trim();
      const Istrat = +line.slice(62, 68).trim();
      const a95 = +line.slice(68, 74).trim();
      const comment = line.slice(74, line.length).trim();

      // Collect info about rows where critical numeric fields parsed as NaN
      const invalidFields: { field: string; rawValue: string }[] = [];
      if (isNaN(x)) invalidFields.push({ field: 'X', rawValue: rawX });
      if (isNaN(y)) invalidFields.push({ field: 'Y', rawValue: rawY });
      if (isNaN(z)) invalidFields.push({ field: 'Z', rawValue: rawZ });
      if (isNaN(mag)) invalidFields.push({ field: 'MAG', rawValue: rawMag });
      if (isNaN(Dgeo)) invalidFields.push({ field: 'Dgeo', rawValue: rawDgeo });
      if (isNaN(Igeo)) invalidFields.push({ field: 'Igeo', rawValue: rawIgeo });

      if (invalidFields.length > 0) {
        invalidRows.push({
          rowNumber: index + 3, // +2 for header lines (empty + metadata), +1 for 1-based
          fileName: name,
          invalidFields,
        });
        return null;
      }

      if (!firstValidLine) {
        firstValidLine = line.trim();
      }

      return {
        id: stepId++,
        step,
        x,
        y,
        z,
        mag,
        Dgeo,
        Igeo,
        Dstrat: isNaN(Dstrat) ? 0 : Dstrat,
        Istrat: isNaN(Istrat) ? 0 : Istrat,
        a95: isNaN(a95) ? 0 : a95,
        comment,
      };
    })
    .filter((step): step is NonNullable<typeof step> => step !== null);

  // Pass 2: infer demagType from the entire steps block (D3). Emit a
  // non-blocking warning if the file is genuinely ambiguous so the UI can
  // tell the user why the demag column is empty.
  const demagType = inferDemagTypeFromStepNames(stepsWithoutDemagType.map((step) => step.step));
  const warnings: ParseWarning[] = [];
  if (demagType === undefined && stepsWithoutDemagType.length > 0) {
    warnings.push(AMBIGUOUS_DEMAG_WARNING);
  }
  const steps = stepsWithoutDemagType.map((step) => ({ ...step, demagType }));

  return {
    data: {
      metadata,
      steps,
      format: 'PMD',
      created: new Date().toISOString(),
    },
    validation: { invalidRows, warnings },
  };
};

export default parsePMD;
