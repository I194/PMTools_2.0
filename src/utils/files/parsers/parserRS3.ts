import { IPmdData } from "../../GlobalTypes";
import Direction from "../../graphs/classes/Direction";
import toReferenceCoordinates from "../../graphs/formatters/toReferenceCoordinates";

/**
 * Process parsing of data from imported .rs3 file
 * @param {string} [data] - The string data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {IPmdData} IPmdData
 */
const parserRS3 = (data: string, name: string): IPmdData => {
  
  // eslint-disable-next-line no-control-regex
  const eol = new RegExp("\r?\n");

  // metadata:
  // Name      Site      Latitude  Longitude  Height    Rock           Age  Fm SDec  SInc  BDec  BInc  FDec  FInc  P1 P2 P3 P4 Note
  // ETALON632                                                                                                     12 0  12 0    
  
  // Get all lines except the first one and all too-short lines (possibly last one)
  const lines = data.split(eol).slice(1).filter(line => line.length > 1);

  const headLine = lines[0];// line with orientation params - metadata in other words
  const metadata = {
    name: name,
    a: +headLine.slice(74, 80),                                     
    b: +headLine.slice(80, 86),
    s: +headLine.slice(86, 92),
    d: +headLine.slice(92, 98),
    v: 8 * 1E-6, // by default
  };
  // поправка параметров 'a' и 'b':
  metadata.s = metadata.s < 90 ? metadata.s + 270 : metadata.s - 90;
  // параметры ориентации
  let P1 = +headLine.slice(110, 113);
  let P2 = +headLine.slice(113, 116);
  let P3 = +headLine.slice(116, 119);
  let P4 = +headLine.slice(119, 122);

  if ((P1 == 3) && (P3 == 3)) metadata.b -= 90;
  if ((P1 == 6) && (P3 == 6)) metadata.b = -metadata.b;
  if ((P1 == 9) && (P3 == 9)) metadata.b += 90;
  if ((P1 == 12) && (P3 == 12)) metadata.b = metadata.b;
  
  // steps data:
  // ID Step[ ]          M[A/m]   Dsp   Isp   Dge   Ige   Dtc   Itc   Dfc   Ifc   Prec    K[e-06 SI] Limit1    Limit2    Note      
  // N  0               6.290588 215.5  89.2                                       0.0                                             
  const steps = lines.slice(2).map((line, index) => {

    // Описывать здесь формат .squid файла я не вижу смысла, формат относительно редкий и никто
    // не использует его как что-то, данные в себе хранящее - все данные из него в .pmd переводят
    const stepSymbol = line.slice(0, 1);
    const stepValue = Number(line.slice(2, 6).trim());
    let step = '';
    if (stepSymbol === 'N') {
      step = 'NRM';
    } else if (stepSymbol === 'A') {
      step = `M${stepValue}`;
    } else {
      step = stepSymbol + stepValue;
    };
    // остальных данных часто почему-то в .rs3 файлах нет, хотя поля для них обозначены. Это странно, но решаемо вот так:
    const mag = +line.slice(12, 28);
    const Dcore = +line.slice(28, 34);
    const Icore = +line.slice(34, 40);
    const a95 = +line.slice(77, 81)
    const comment = line.slice(116);
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
    format: "RS3",
    created: new Date().toISOString(),
  };

}

export default parserRS3;

