const parseDIR = (data: string, name: string) => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");
  // Get all lines except the last one (it's garbage)
  const lines = data.split(eol).filter(line => line.length > 1);

  const interpretations = lines.map((line) => {

    // ID | CODE | STEPRANGE | N | Dg | Ig | kg | Ds | Is | MAD | Comment 
    // it's old format and we can't just split by " " 'cause it can cause issues
    const id = line.slice(0, 7).trim();
    const code = line.slice(7, 14).trim();
    const stepRange = line.slice(14, 24).trim();
    const stepCount = Number(line.slice(24, 27).trim());
    const Dgeo = Number(line.slice(27, 33).trim());
    const Igeo = Number(line.slice(33, 39).trim());
    const Dstrat = Number(line.slice(39, 45).trim());
    const Istrat = Number(line.slice(45, 51).trim());
    const mad = Number(line.slice(51, 57).trim());
    const k = Number(line.slice(57, 63).trim());
    const comment = line.slice(63, line.length).trim();

    // there is no standard for demagnetization symbol... and idk why
    // normally it's T20-T570, but sometimes it's NRM-T570, so... split by '-'
    const demagSmbl = stepRange.split('').includes('-') ? stepRange.split('-')[1].split('')[0] : '';
    const thermalTypes = ['T', 't'];
    const alternatingTypes = ['M', 'm'];

    let demagType = undefined;

    if (thermalTypes.indexOf(demagSmbl) > -1) demagType = 'thermal';
    else if (alternatingTypes.indexOf(demagSmbl) > -1) demagType = 'alternating field';

    return {
      id,
      code,
      stepRange,
      stepCount,
      Dgeo,
      Igeo,
      Dstrat,
      Istrat,
      mad,
      k,
      comment,
      demagType,
    };

  });
  
  return {
    name,
    interpretations,
    format: "DIR",
    created: new Date().toISOString(),
  };

}

export default parseDIR;