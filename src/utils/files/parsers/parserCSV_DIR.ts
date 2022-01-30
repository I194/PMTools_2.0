const parseCSV_DIR = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the last one (it's garbage)
  let lines = data.split(eol).filter(line => line.length > 1);

  const interpretations = lines.slice(1).map((line) => {
    
    const params = line.replace(/\s+/g, ' ').split(',');

    // id | Code | StepRange | N | Dgeo | Igeo | Dstrat | Istrat | MAD | K | Comment 
    const id = params[0];
    const code = params[1];
    const stepRange = params[2];
    const stepCount = Number(params[3]);
    const Dgeo = +(+params[4]).toFixed(1);
    const Igeo = +(+params[5]).toFixed(1);
    const Dstrat = +(+params[6]).toFixed(1);
    const Istrat = +(+params[7]).toFixed(1);
    const mad = +(+params[8]).toFixed(1);
    const k = +(+params[9]);

    let comment = '';
    // comment may be with commas
    for (let i = 10; i < params.length; i++) comment += params[i];
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
    format: "CSV_DIR",
    created: new Date().toISOString(),
  };

}

export default parseCSV_DIR;