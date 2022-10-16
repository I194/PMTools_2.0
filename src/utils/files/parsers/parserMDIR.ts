import { IDirData } from "../../GlobalTypes";

const parseMDIR = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the last one (it's garbage)
  const lines = data.split(eol).filter(line => line.length > 1);
  // it's must an odd number of lines in .mdir file, 
  // otherwise the structure of the future IDirData will be broken 
  if (lines.length % 2 !== 0) lines.pop();

  const interpretations: IDirData['interpretations'] = [];  
  for (let i = 0; i < lines.length; i += 2) {
    // .mdir files consits of rows which can be grouped by pairs:
    // first row described the parameters of direction in the geographic coordinates
    // and the second row described them in the stratigraphic coordinates
    // so it looks like this:
    // ID | CODE-G | STEPRANGE | N | Dg | Ig | 90 | 0  | Kg | MADg | Comment 
    // ID | CODE-S | STEPRANGE | N | 90 | 0  | Ds | Is | Ks | MADs | Comment
    // 90 and 0 here are like a placeholders
    // and also it's an old format and so we can't just split by " " because it can cause issues
    const lineGeo = lines[i];
    const lineStrat = lines[i + 1];
    const label = lineGeo.slice(0, 7).trim();
    const code = lineGeo.slice(7, 14).trim().split(' G')[0];
    const stepRange = lineGeo.slice(14, 24).trim();
    const stepCount = Number(lineGeo.slice(24, 27).trim());
    const Dgeo = Number(lineGeo.slice(27, 33).trim());
    const Igeo = Number(lineGeo.slice(33, 39).trim());
    const Dstrat = Number(lineStrat.slice(39, 45).trim());
    const Istrat = Number(lineStrat.slice(45, 51).trim());
    const Kgeo = Number(lineGeo.slice(51, 58).trim());
    const MADgeo = Number(lineGeo.slice(58, 64).trim());
    const Kstrat = Number(lineStrat.slice(51, 58).trim());
    const MADstrat = Number(lineStrat.slice(58, 64).trim());
    const comment = lineGeo.slice(64, lineGeo.length).trim();

    // there is no standard for demagnetization symbol... and idk why
    // normally it's T20-T570, but sometimes it's NRM-T570, so... split by '-'
    const demagSmbl = stepRange.split('').includes('-') ? stepRange.split('-')[1].split('')[0] : '';
    const thermalTypes = ['T', 't'];
    const alternatingTypes = ['M', 'm'];

    let demagType: 'thermal' | 'alternating field' | undefined = undefined;

    if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
    else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';

    const interpretation = {
      id: (i + 2) / 2, // (0 + 2) / 2 = 1; (2 + 2) / 2 = 4; (4 + 2) / 2 = 3;...
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

    interpretations.push(interpretation);
  };
  
  return {
    name,
    interpretations,
    format: "MDIR",
    created: new Date().toISOString(),
  };

}

export default parseMDIR;

