const parseCSV_PMD = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the last one (it's garbage)
  let lines = data.split(eol).filter(line => line.length > 1);
  
  const headLine = lines[1].split(',');

  const metadata = {
    name,
    a: +headLine[0],
    b: +headLine[1],
    s: +headLine[2],
    d: +headLine[3],  
    v: +headLine[4],
  }

  const steps = lines.slice(3).map((line) => {
    
    const params = line.replace(/\s+/g, ' ').split(',');

    // PAL | Xc (Am2) | Yc (Am2) | Zc (Am2) | MAG (A/m) | Dg | Ig | Ds | Is| a95
    // PAL === Step (mT or temp degrees)
    // it's old format and we can't just split by " " 'cause it can cause issues
    const step = params[0];
    const x = +(+params[1]).toExponential(2);
    const y = +(+params[2]).toExponential(2);
    const z = +(+params[3]).toExponential(2);
    const mag = +(+params[4]).toExponential(2);
    const Dgeo = +(+params[5]).toFixed(1);
    const Igeo = +(+params[6]).toFixed(1);
    const Dstrat = +(+params[7]).toFixed(1);
    const Istrat = +(+params[8]).toFixed(1);
    const a95 = +(+params[9]).toFixed(1);

    let comment = '';
    // comment may be with commas
    for (let i = 10; i < params.length; i++) comment += params[i];
    comment = comment.trim();

    // there is no standard for demagnetization symbol... and idk why
    const demagSmbl = line.slice(0, 1);
    const thermalTypes = ['T', 't'];
    const alternatingTypes = ['M', 'm'];

    let demagType = undefined;

    if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
    else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';

    return {
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
    format: "CSV_PMD",
    created: new Date().toISOString(),
  };

}

export default parseCSV_PMD;