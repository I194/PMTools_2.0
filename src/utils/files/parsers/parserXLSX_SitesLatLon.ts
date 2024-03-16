import * as XLSX from 'xlsx';
import { ISitesData } from "../../GlobalTypes";
import { xlsx_to_csv } from '../subFunctions';
import parseCSV_SitesLatLon from './parserCSV_SitesLatLon';

/**
 * Process parsing of data from imported .csv file containing geographical data for VGPs calculation
 * @param {ArrayBuffer} [data] - The ArrayBuffer data from imported file
 * @param {string} [name] - The name of imported file
 * @returns {ISitesData} ISitesData
 */
const parseXLSX_SitesLatLon = (data: ArrayBuffer, name: string): ISitesData => {
  const Uint8Data = new Uint8Array(data);
  const workbook = XLSX.read(Uint8Data, {type: 'array'});
  const res = xlsx_to_csv(workbook);
  const finalRes = parseCSV_SitesLatLon(res, name);

  return finalRes;
}

export default parseXLSX_SitesLatLon;

