import { IPmdData } from '../../GlobalTypes';
import { InvalidRowInfo, ParseResult } from '../validation';

/**
 * Process parsing of data from imported .pmd file
 * @param {string} [data] - The string data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {ParseResult<IPmdData>} Parsed data with validation info
 */
const parsePMD = (data: string, name: string): ParseResult<IPmdData> => {
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp('\r?\n');
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

  // there is no standard for demagnetization symbol... and idk why
  const thermalTypes = ['T', 't'];
  const alternatingTypes = ['M', 'm'];

  let demagType: 'thermal' | 'alternating field' | undefined = undefined;

  const invalidRows: InvalidRowInfo[] = [];
  let firstValidLine: string | undefined;

  let stepId = 1;
  const steps = lines
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

      if (!demagType) {
        const demagSmbl = line.slice(0, 1);

        if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
        else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';
      }

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
        demagType,
      };
    })
    .filter((step): step is NonNullable<typeof step> => step !== null);

  return {
    data: {
      metadata,
      steps,
      format: 'PMD',
      created: new Date().toISOString(),
    },
    validation: { invalidRows },
  };
};

export default parsePMD;
