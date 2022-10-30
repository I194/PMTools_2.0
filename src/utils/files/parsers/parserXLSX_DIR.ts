import * as XLSX from 'xlsx';
import { IDirData } from '../../GlobalTypes';
import { xlsx_to_csv } from '../subFunctions';
import parseCSV_DIR from './parserCSV_DIR';

/**
 * Process parsing of data from imported .xlsx dir-like file
 * @param {string} [data] - The string data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {IDirData} IDirData
 */
const parseXLSX_DIR = (data: ArrayBuffer, name: string): IDirData => {
  
  const Uint8Data = new Uint8Array(data);
  const workbook = XLSX.read(Uint8Data, {type: 'array'});
  const res = xlsx_to_csv(workbook);
  const finalRes = parseCSV_DIR(res, name);

  return finalRes;

}

export default parseXLSX_DIR;

