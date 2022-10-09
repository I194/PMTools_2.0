import { IDirData } from "../../GlobalTypes";

const parseCSV_DIR = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the last one (it's garbage)
  let lines = data.split(eol).filter(line => line.length > 1);

  const interpretations: IDirData['interpretations'] = lines.slice(1).map((line, index) => {
    
    const params = line.replace(/\s+/g, ' ').split(',');

    // id | Code | StepRange | N | Dgeo | Igeo | Kgeo | MADgeo | Dstrat | Istrat | Kstrat | MADstrat | Comment 
    const label = params[0];
    const code = params[1];
    const stepRange = params[2];
    const stepCount = Number(params[3]);
    const Dgeo = +(+params[4]).toFixed(1);
    const Igeo = +(+params[5]).toFixed(1);
    const Kgeo = +(+params[6]).toFixed(1);
    const MADgeo = +(+params[7]).toFixed(1);
    const Dstrat = +(+params[8]).toFixed(1);
    const Istrat = +(+params[9]).toFixed(1);
    const Kstrat = +(+params[10]).toFixed(1);
    const MADstrat = +(+params[11]).toFixed(1);

    let comment = '';
    // comment may be with commas
    for (let i = 12; i < params.length; i++) comment += params[i];
    comment = comment.trim();

    // there is no standard for demagnetization symbol... and idk why
    const demagSmbl = stepRange.split('')[0];
    const thermalTypes = ['T', 't'];
    const alternatingTypes = ['M', 'm'];

    let demagType: 'thermal' | 'alternating field' | undefined = undefined;
    if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
    else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';

    return {
      id: index + 1,
      label,
      code,
      gcNormal: code.slice(0, 2) === 'GC',
      demagType,
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
      comment
    };

  });
  
  return {
    name,
    interpretations,
    format: "CSV_DIR",
    created: new Date().toISOString(),
  };

}

export default parseCSV_DIR;