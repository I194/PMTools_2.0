import * as XLSX from 'xlsx';
import { xlsx_to_csv } from '../subFunctions';
import parseCSV_DIR from './parserCSV_DIR';

const parseXLSX_DIR = (data: ArrayBuffer, name: string) => {
  
  const Uint8Data = new Uint8Array(data);
  const workbook = XLSX.read(Uint8Data, {type: 'array'});
  const res = xlsx_to_csv(workbook);
  const finalRes = parseCSV_DIR(res, name);

  return finalRes;

}

export default parseXLSX_DIR;