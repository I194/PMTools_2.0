import { IDirData } from '../../GlobalTypes';
import { InvalidRowInfo, ParseResult } from '../validation';

/**
 * Process parsing of data from imported .dir file
 * @param {string} [data] - The string data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {ParseResult<IDirData>} Parsed data with validation info
 */
const parseDIR = (data: string, name: string): ParseResult<IDirData> => {
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp('\r?\n');
  // Get all lines except the last one (it's garbage)
  const lines = data.split(eol).filter((line) => line.length > 1);

  const interpretations: IDirData['interpretations'] = [];
  const invalidRows: InvalidRowInfo[] = [];
  let index = 0;
  let id = 1;

  while (index < lines.length) {
    const line = lines[index];
    const label = line.slice(0, 7).trim();
    const code = line.slice(7, 14).trim();
    const stepRange = line.slice(14, 24).trim();
    let stepCount = Number(line.slice(24, 27).trim());
    const comment = line.slice(64, line.length).trim();

    // Empty strings must become NaN, not 0 (JS quirk: Number("") === 0)
    const rawDgeo = line.slice(27, 33).trim();
    const rawIgeo = line.slice(33, 39).trim();
    let Dgeo = rawDgeo === '' ? NaN : Number(rawDgeo);
    let Igeo = rawIgeo === '' ? NaN : Number(rawIgeo);
    let Dstrat = Number(line.slice(39, 45).trim());
    let Istrat = Number(line.slice(45, 51).trim());
    let MADgeo = Number(line.slice(51, 58).trim());
    let Kgeo = Number(line.slice(58, 64).trim());
    let MADstrat = Number(line.slice(51, 58).trim());
    let Kstrat = Number(line.slice(58, 64).trim());

    let skipNextLine = false;

    if (code === 'rep G') {
      // .dir files can consist of rows which can be grouped by pairs:
      // first row described the parameters of direction in the geographic coordinates
      // and the second row described them in the stratigraphic coordinates
      // so it looks like this:
      // ID | CODE-G | STEPRANGE | N | Dg | Ig | 90 | 0  | Kg | MADg | Comment
      // ID | CODE-S | STEPRANGE | N | 90 | 0  | Ds | Is | Ks | MADs | Comment
      // 90 and 0 here are like a placeholders
      // and also it's an old format and so we can't just split by " " because it can cause issues
      const lineGeo = lines[index];
      const lineStrat = lines[index + 1];

      if (!lineStrat) break; // unexpected 'rep G' code, ingore it and finish parsing
      skipNextLine = true;

      const rawDgeoGeo = lineGeo.slice(27, 33).trim();
      const rawIgeoGeo = lineGeo.slice(33, 39).trim();
      Dgeo = rawDgeoGeo === '' ? NaN : Number(rawDgeoGeo);
      Igeo = rawIgeoGeo === '' ? NaN : Number(rawIgeoGeo);
      Dstrat = Number(lineStrat.slice(39, 45).trim());
      Istrat = Number(lineStrat.slice(45, 51).trim());
      Kgeo = Number(lineGeo.slice(51, 58).trim());
      MADgeo = Number(lineGeo.slice(58, 64).trim());
      Kstrat = Number(lineStrat.slice(51, 58).trim());
      MADstrat = Number(lineStrat.slice(58, 64).trim());
    }

    // there is no standard for demagnetization symbol... and idk why
    // normally it's T20-T570, but sometimes it's NRM-T570, so... split by '-'
    const demagSmbl = stepRange.split('').includes('-') ? stepRange.split('-')[1].split('')[0] : '';
    const thermalTypes = ['T', 't'];
    const alternatingTypes = ['M', 'm'];

    let demagType: 'thermal' | 'alternating field' | undefined = undefined;

    if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
    else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';

    // Collect info about rows where critical numeric fields parsed as NaN
    const invalidFields: { field: string; rawValue: string }[] = [];
    if (isNaN(Dgeo)) invalidFields.push({ field: 'Dgeo', rawValue: rawDgeo });
    if (isNaN(Igeo)) invalidFields.push({ field: 'Igeo', rawValue: rawIgeo });

    if (invalidFields.length > 0) {
      invalidRows.push({
        rowNumber: index + 1, // 1-based line number
        fileName: name,
        invalidFields,
      });
      index += skipNextLine ? 2 : 1;
      continue;
    }

    // Default non-critical NaN fields to 0
    if (isNaN(Dstrat)) Dstrat = 0;
    if (isNaN(Istrat)) Istrat = 0;
    if (isNaN(MADgeo)) MADgeo = 0;
    if (isNaN(MADstrat)) MADstrat = 0;
    if (isNaN(Kgeo)) Kgeo = 0;
    if (isNaN(Kstrat)) Kstrat = 0;
    if (isNaN(stepCount)) stepCount = 0;

    const interpretation = {
      id,
      label,
      code,
      gcNormal: code.slice(0, 2) === 'GC',
      stepRange,
      stepCount,
      Dgeo,
      Igeo,
      Dstrat,
      Istrat,
      MADgeo,
      MADstrat,
      Kgeo,
      Kstrat,
      comment,
      demagType,
    };

    id++;
    index += skipNextLine ? 2 : 1;
    interpretations.push(interpretation);
  }

  return {
    data: {
      name,
      interpretations,
      format: 'DIR',
      created: new Date().toISOString(),
    },
    validation: { invalidRows },
  };
};

export default parseDIR;
