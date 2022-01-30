const parsePMD = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the last one (it's garbage) and the first one (it's empty)
  const lines = data.split(eol).slice(1).filter(line => line.length > 1);

  // const headLine = lines[0].replace(/\s+/g, ' ').split(' ');
  // const metadata = headLine.map((param: string) => )
  
  const headLine = lines[0]; // line with speciment name and orientation params - metadata in other words
  const metadata = {
    name: headLine.slice(0, 10).trim() || name,
    a: +headLine.slice(12, 20).trim(),
    b: +headLine.slice(22, 30).trim(),
    s: +headLine.slice(32, 40).trim(),
    d: +headLine.slice(42, 50).trim(),  
    v: +headLine.slice(52, headLine.length).trim().toLowerCase().split('m')[0],
  }

  const steps = lines.slice(2).map((line) => {

    // PAL | Xc (Am2) | Yc (Am2) | Zc (Am2) | MAG (A/m) | Dg | Ig | Ds | Is| a95
    // PAL === Step (mT or temp degrees)
    // it's old format and we can't just split by " " 'cause it can cause issues
    const step = line.slice(0, 4).trim();
    const x = +line.slice(4, 14).trim();
    const y = +line.slice(14, 24).trim();
    const z = +line.slice(24, 34).trim();
    const mag = +line.slice(34, 44).trim();
    const Dgeo = +line.slice(44, 50).trim();
    const Igeo = +line.slice(50, 56).trim();
    const Dstrat = +line.slice(56, 62).trim();
    const Istrat = +line.slice(62, 68).trim();
    const a95 = +line.slice(68, 74).trim();
    const comment = line.slice(74, line.length).trim();

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
    format: "PMD",
    created: new Date().toISOString(),
  };

}

export default parsePMD;