import { IPmdData } from '../../GlobalTypes';
import Direction from '../../graphs/classes/Direction';
import toReferenceCoordinates from '../../graphs/formatters/toReferenceCoordinates';

/**
 * Process parsing of data from imported .squid file
 * @param {string} [data] - The string data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {IPmdData} IPmdData
 */
const parseSQUID = (data: string, name: string): IPmdData => {
  // Validate input to avoid crashes on empty or invalid files
  if (!data || typeof data !== 'string' || data.trim().length === 0) {
    throw new Error(`Empty .squid file: ${name}`);
  }

  // eslint-disable-next-line no-control-regex
  const eol = /\r\n|\r|\n/;
  // Get all lines except the first one (it's just copy of filename) and all too-short lines
  const lines = data
    .split(eol)
    .slice(1)
    .filter((line) => line.length > 1);
  if (!lines.length) {
    throw new Error(`Invalid .squid file (no data lines): ${name}`);
  }

  const headLine = lines[0].replace(/\s+/g, ' ').split(' '); // line with orientation params - metadata in other words
  const metadata = {
    name: name, // inner pmd name lay here: data.split(eol)[0].slice(0, 10).trim(),
    a: +headLine[1],
    b: +headLine[2],
    s: +headLine[3],
    d: +headLine[4],
    v: +headLine[5] * 1e-6,
  };
  // поправка параметров 'a' и 'b':
  metadata.a = metadata.a < 90 ? metadata.a + 270 : metadata.a - 90;

  const allDataLines = lines.slice(1);
  if (allDataLines.length === 0) {
    throw new Error(`No measurement data in .squid file: ${name}`);
  }

  // ARM-acquisition block truncation (D5 policy, R.V. Veselovsky 2026-05-09).
  // After AF demagnetization, a `.squid` file may contain an ARM-acquisition
  // section (line starting with `ARM`) followed by AF-of-ARM lines. These are
  // a measurement-protocol artifact, not data PMTools should display or analyze.
  // Drop the `ARM` line and every subsequent line silently — this is normal
  // for many real `.squid` files; no warning, no log message.
  const armIndex = allDataLines.findIndex((line) => line.slice(0, 3) === 'ARM');
  const dataLines = armIndex === -1 ? allDataLines : allDataLines.slice(0, armIndex);
  if (dataLines.length === 0) {
    throw new Error(`No measurement data before ARM block in .squid file: ${name}`);
  }

  const steps = dataLines.map((line, index) => {
    // SQUID format reference: the original SQUID→PMD converter (R.V. Veselovsky)
    // is the domain-authority golden output. Step naming and unit conventions
    // here match that converter exactly — see fixtures/parsers/squid/README.md
    // "Locked behaviors" for the policy decisions.
    const stepHeader = line.slice(0, 2);
    const firstChar = line.slice(0, 1);
    const stepValue = Number(line.slice(2, 6).trim());
    let step = '';
    if (firstChar === 'N') {
      step = 'NRM';
    } else if (stepHeader === 'AF') {
      // AF fields in `.squid` are recorded in Oersted; PMTools displays mT.
      // 1 Oe ≈ 0.1 mT — convert by dividing by 10 (RV convention).
      // Zero-pad to 3 digits so step names sort lexically and match the PMD
      // M-step naming format (`M000`, `M010`, `M150`, ...). The bare `AF`
      // first-line (zero-field NRM measurement) becomes `M000`, distinguishing
      // it from the previous-buggy `M0` produced before this fix.
      const mTesla = Math.round(stepValue / 10);
      step = `M${String(mTesla).padStart(3, '0')}`;
    } else {
      step = firstChar + stepValue;
    }
    // это все доступные данные, которые мы можем использовать для дальнейших построений, больше .squid ничего полезного не даёт
    const mag = +line.slice(31, 39) * 1e3;
    const Dcore = +line.slice(46, 52);
    const Icore = +line.slice(52, 58);
    // все остальные данные - производные
    const coreDirection = new Direction(Dcore, Icore, mag * metadata.v);
    const coreCoordinates = coreDirection.toCartesian();
    const correctedMetadata = { ...metadata, b: 90 - metadata.b };
    const geoCoordinates = toReferenceCoordinates('geographic', correctedMetadata, coreCoordinates);
    const stratCoordinates = toReferenceCoordinates(
      'stratigraphic',
      correctedMetadata,
      coreCoordinates,
    );
    // это уже то, что пойдёт в отображение
    const [x, y, z] = coreCoordinates.toArray().map((coord) => +coord.toExponential(2));
    const [Dgeo, Igeo] = geoCoordinates.toDirection().toArray();
    const [Dstrat, Istrat] = stratCoordinates.toDirection().toArray();
    const a95 = 0; // со squid-магнитометра не приходит параметр a95, что, конечно, очень неправильно, но что поделаешь?
    const comment = ''; // нет комментариев в squid-файле

    // there is no standard for demagnetization symbol... and idk why
    const demagSmbl = step[0];
    const thermalTypes = ['T', 't'];
    const alternatingTypes = ['M', 'm'];

    let demagType: 'thermal' | 'alternating field' | undefined = undefined;

    if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
    else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';

    return {
      id: index + 1,
      step,
      x,
      y,
      z,
      mag,
      Dgeo,
      Igeo,
      Dstrat,
      Istrat,
      a95,
      comment,
      demagType,
    };
  });

  return {
    metadata,
    steps,
    format: 'SQUID',
    created: new Date().toISOString(),
  };
};

export default parseSQUID;
