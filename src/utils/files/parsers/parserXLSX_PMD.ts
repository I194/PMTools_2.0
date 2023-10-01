import * as XLSX from 'xlsx';
import { IPmdData } from '../../GlobalTypes';
import { xlsx_to_csv } from '../subFunctions';
import parseCSV_PMD from './parserCSV_PMD';

/**
 * Process parsing of data from imported .xlsx pmd-like file
 * @param {ArrayBuffer} [data] - The ArrayBuffer data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {IPmdData} IPmdData
 */
const parseXLSX_PMD = (data: ArrayBuffer, name: string): IPmdData => {
  
  const Uint8Data = new Uint8Array(data);
  const workbook = XLSX.read(Uint8Data, {type: 'array'});
  const res = xlsx_to_csv(workbook);
  const finalRes = parseCSV_PMD(res, name);

  return finalRes;

}

export default parseXLSX_PMD;

