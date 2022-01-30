import * as XLSX from 'xlsx';
import { xlsx_to_csv } from '../subFunctions';
import parseCSV_PMD from './parserCSV_PMD';

const parseXLSX_PMD = (data: ArrayBuffer, name: string) => {
  
  const Uint8Data = new Uint8Array(data);
  const workbook = XLSX.read(Uint8Data, {type: 'array'});
  const res = xlsx_to_csv(workbook);
  const finalRes = parseCSV_PMD(res, name);

  return finalRes;

}

export default parseXLSX_PMD;