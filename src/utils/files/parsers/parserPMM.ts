const parsePMM = (data: string, name: string) => {
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except first and the last one (they're garbage)
  const lines = data.split(eol).slice(1).filter(line => line.length > 1);

  const header = lines[0].replace(/"/g, '').split(',');
  name = header[0] || name;

  // Skip 1 and 2 lines 'cause they're in the header 
  const interpretations = lines.slice(2).map((line) => {
    
    const params = line.replace(/\s+/g, '').split(',');

    // ID | CODE | STEPRANGE | N | Dg | Ig | kg | a95g | Ds | Is | ks | a95s | comment 
    // 'kg' and 'ks' - idiotic garbage and, moreover, there is no 'a95' - there is only MAD (Maximum Angular Deviation)
    const id = params[0];
    const code = params[1];
    const stepRange = params[2];
    const stepCount = Number(params[3]);
    const Dgeo = Number(params[4]);
    const Igeo = Number(params[5]);
    const madGeo = Number(params[7]);
    const Dstrat = Number(params[8]);
    const Istrat = Number(params[9]);
    // const madStrat = Number(params[11]);
    // but we don't need madStrat and madGeo at the same time - they must be equal, otherwise some of them is incorrect, so...
    const mad = madGeo;
    const k = 0;

    // comment may be with spaces
    let comment = '';
    for (let i = 12; i < params.length; i++) comment += params[i];
    comment = comment.trim();

    // there is no standard for demagnetization symbol... and idk why
    const demagSmbl = stepRange.split('')[0];
    const thermalTypes = ['T', 't'];
    const alternatingTypes = ['M', 'm'];

    let demagType = undefined;

    if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
    else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';

    return {
      id,
      code,
      demagType,
      stepRange,
      stepCount,
      Dgeo,
      Igeo,
      Dstrat,
      Istrat,
      mad,
      k,
      comment
    };

  });
  
  return {
    name,
    interpretations,
    format: "PMM",
    created: new Date().toISOString(),
  };

}

export default parsePMM;