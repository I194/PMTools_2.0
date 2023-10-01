import { IPmdData } from "../../GlobalTypes";
import Direction from "../../graphs/classes/Direction";
import toReferenceCoordinates from "../../graphs/formatters/toReferenceCoordinates";

/**
 * Process parsing of data from imported .squid file
 * @param {string} [data] - The string data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {IPmdData} IPmdData
 */
const parseSQUID = (data: string, name: string): IPmdData => {
  
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
  // поправка параметров 'a' и 'b':
  metadata.a = metadata.a < 90 ? metadata.a + 270 : metadata.a - 90;

  const steps = lines.slice(1).map((line, index) => {

    // Описывать здесь формат .squid файла я не вижу смысла, формат относительно редкий и никто
    // не использует его как что-то, данные в себе хранящее - все данные из него в .pmd переводят
    const stepSymbol = line.slice(0, 1);
    const stepValue = Number(line.slice(2, 6).trim());
    let step = '';
    if (stepSymbol === 'N') {
      step = 'NRM';
    } else if (stepSymbol === 'A') {
      // step = `M${stepValue / 10}` // почему-то так было в коде конвертера у РВ, но по факту это неправильно
      step = `M${stepValue}`;
    } else {
      step = stepSymbol + stepValue;
    };
    // это все доступные данные, которые мы можем использовать для дальнейших построений, больше .squid ничего полезного не даёт
    const mag = +line.slice(31, 39) * 1E3;
    const Dcore = +line.slice(46, 52);
    const Icore = +line.slice(52, 58);
    // все остальные данные - производные
    const coreDirection = new Direction(Dcore, Icore, mag * metadata.v);
    const coreCoordinates = coreDirection.toCartesian();
    const correctedMetadata = {...metadata, b: 90 - metadata.b};
    const geoCoordinates = toReferenceCoordinates('geographic', correctedMetadata, coreCoordinates);
    const stratCoordinates = toReferenceCoordinates('stratigraphic', correctedMetadata, coreCoordinates);
    // это уже то, что пойдёт в отображение
    const [ x, y, z ] = coreCoordinates.toArray().map(coord => +coord.toExponential(2));
    const [ Dgeo, Igeo ] = geoCoordinates.toDirection().toArray();
    const [ Dstrat, Istrat ] = stratCoordinates.toDirection().toArray();
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
    format: "SQUID",
    created: new Date().toISOString(),
  };

}

export default parseSQUID;

