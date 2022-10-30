import * as XLSX from 'xlsx';
import { dataModel_interpretation_from_pca, dataModel_interpretation_from_dir } from '../fileConstants';
import { download, getDirectionalData, s2ab } from '../fileManipulations';
import { IDirData } from '../../GlobalTypes';
import { getFileName, putParamToString } from '../subFunctions';

/**
 * Converts parsed directional data (data from files with .dir, .pmm extensions and their .csv and .xlsx analogues) to .dir file
 * @param {IDirData} [parsedData] - The parsed directional data
 * @returns {Promise<void>} Instead of return, it calls download() function, so file exported directly to user machine:
 * @example download(res, `${filename}.dir`, 'text/plain;charset=utf-8');
 */
export const toDIR = async (parsedData: IDirData): Promise<void> => {
  const data = parsedData;

  const lines = data.interpretations.map((interpretation: any) => {
    const line = Object.keys(dataModel_interpretation_from_pca).reduce((line, param) => {
      return line + putParamToString(interpretation[param], dataModel_interpretation_from_pca[param])
    }, '');
    return line;
  }).join('\r\n');

  const res = lines + '\r\n';
  const filename = getFileName(data.name);

  download(res, `${filename}.dir`, 'text/plain;charset=utf-8');
};

/**
 * Converts parsed directional data (data from files with .dir, .pmm extensions and their .csv and .xlsx analogues) to .pmm file
 * @param {IDirData} [parsedData] - The parsed directional data
 * @returns {Promise<void>} Instead of return, it calls download() function, so file exported directly to user machine:
 * @example download(res, `${filename}.pmm`, 'text/plain;charset=utf-8');
 */
export const toPMM = async (parsedData: IDirData): Promise<void> => {
  const data = parsedData;

  const metaLines = `"file_comment"\n${data.name},"author","2021-11-27"\n`;
  const columnNames = 'ID,CODE,STEPRANGE,N,Dg,Ig,kg,a95g,Ds,Is,ks,a95s,comment\n';

  const lines = data.interpretations.map((interpretation: any) => {
    const line = Object.keys(dataModel_interpretation_from_dir).reduce((line, param, i) => {
      if (i > 13) return line;
      return line + `${interpretation[param]},`;
    }, '');
    return line;
  }).join('\n');

  const res = metaLines + columnNames + lines;
  const filename = getFileName(data.name);

  download(res, `${filename}.pmm`, 'text/plain;charset=utf-8');
};

/**
 * Converts parsed directional data (data from files with .dir, .pmm extensions and their .csv and .xlsx analogues) to .csv file
 * @param {IDirData} [parsedData] - The parsed directional data
 * @returns {Promise<void>} Instead of return, it calls download() function, so file exported directly to user machine:
 * @example download(res, `${filename}.csv`, 'text/csv;charset=utf-8');
 */
export const toCSV_DIR = async (parsedData: IDirData): Promise<void> => {
  const data = parsedData;
  
  const columNames = 'id,Code,StepRange,N,Dgeo,Igeo,Kgeo,MADgeo,Dstrat,Istrat,Kstrat,MADstrat,Comment\n';

  const lines = data.interpretations.map((interpretation: any) => {
    const line = Object.keys(dataModel_interpretation_from_dir).reduce((line, param) => {
      return line + `${interpretation[param]},`
    }, '')
    return line.slice(0, -1);
  }).join('\n');

  const res = columNames + lines;
  const filename = getFileName(data.name);

  download(res, `${filename}.csv`, 'text/csv;charset=utf-8');
};

/**
 * Converts parsed directional data (data from files with .dir, .pmm extensions and their .csv and .xlsx analogues) to .xlsx file
 * @param {IDirData} [parsedData] - The parsed directional data
 * @returns {Promise<void>} Instead of return, it calls download() function, so file exported directly to user machine:
 * @example download(res, `${filename}.xlsx`, "application/octet-stream");
 */
export const toXLSX_DIR = async (parsedData: IDirData): Promise<void> => {
  const data = parsedData;

  const columnNames = 'id,Code,StepRange,N,Dgeo,Igeo,Kgeo,MADgeo,Dstrat,Istrat,Kstrat,MADstrat,Comment'.split(',');

  const lines = data.interpretations.map((interpretation: any) => {
    return Object.keys(dataModel_interpretation_from_dir).map((param) => {
      return interpretation[param];
    });
  });

  const wbook = XLSX.utils.book_new();
  wbook.SheetNames.push('data');
  lines.unshift(columnNames);
  const wsheet = XLSX.utils.aoa_to_sheet(lines);
  wbook.Sheets.data = wsheet;
  const wbinary = XLSX.write(wbook, {bookType: 'xlsx', type: 'binary'});

  const res = s2ab(wbinary);
  const filename = getFileName(data.name);

  download(res, `${filename}.xlsx`, "application/octet-stream");
};

