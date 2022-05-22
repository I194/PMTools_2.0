const parseSQUID = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the first one (it's just copy of filename) and all too-short lines
  const lines = data.split(eol).slice(1).filter(line => line.length > 1);
  
  const headLine = lines[0].replace(/\s+/g, ' ').split(' '); // line with orientation params - metadata in other words
  const metadata = {
    name: name, // inner pmd name lay here: data.split(eol)[0].slice(0, 10).trim(),
    a: +headLine[1],
    b: +headLine[2],
    s: +headLine[3],
    d: +headLine[4],
    v: +headLine[5] * 1E-6,
  };

  const steps = lines.slice(1).map((line, index) => {

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
    format: "PMD",
    created: new Date().toISOString(),
  };

}

export default parseSQUID;