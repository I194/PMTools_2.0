import * as XLSX from 'xlsx';
import { dataModel_interpretation } from '../fileConstants';
import { download, getDirectionalData, s2ab } from '../fileManipulations';
import { IDirData } from '../../GlobalTypes';
import { getFileName, putParamToString } from '../subFunctions';

export const toDIR = async (file: File, parsedData?: IDirData) => {
  
  const data = parsedData ? parsedData : await getDirectionalData(file, 'dir') as IDirData;

  console.log(data.interpretations[0].stepRange, data.interpretations[0].stepRange.length);

  const lines = data.interpretations.map((interpretation: any) => {
    const line = Object.keys(dataModel_interpretation).reduce((line, param) => {
      return line + putParamToString(interpretation[param], dataModel_interpretation[param])
    }, '');
    return line;
  }).join('\r\n');

  const res = lines + '\r\n';
  const filename = getFileName(data.name);

  download(res, `${filename}.dir`, 'text/plain;charset=utf-8');
};

export const toPMM = async (file: File, parsedData?: IDirData) => {

  const data = parsedData ? parsedData : await getDirectionalData(file, 'dir') as IDirData;

  const metaLines = `"file_comment"\n${data.name},"author","2021-11-27"\n`;
  const columnNames = 'ID,CODE,STEPRANGE,N,Dg,Ig,kg,a95g,Ds,Is,ks,a95s,comment\n';

  const lines = data.interpretations.map((interpretation: any) => {
    const line = Object.keys(dataModel_interpretation).reduce((line, param, i) => {
      if (i === 6) return line + `${interpretation.k},${interpretation.mad},${interpretation[param]},`;
      if (i === 8) return line + `${interpretation.k},${interpretation.mad},${interpretation.comment}`;
      if (i > 8) return line;
      return line + `${interpretation[param]},`;
    }, '');
    return line;
  }).join('\n');

  const res = metaLines + columnNames + lines;
  const filename = getFileName(data.name);

  download(res, `${filename}.pmm`, 'text/plain;charset=utf-8');
};

export const toCSV_DIR = async (file: File, parsedData?: IDirData) => {

  const data = parsedData ? parsedData : await getDirectionalData(file, 'dir') as IDirData;
  
  const columNames = 'id,Code,StepRange,N,Dgeo,Igeo,Dstrat,Istrat,MAD,K,Comment\n';

  const lines = data.interpretations.map((interpretation: any) => {
    const line = Object.keys(dataModel_interpretation).reduce((line, param) => {
      return line + `${interpretation[param]},`
    }, '')
    return line.slice(0, -1);
  }).join('\n');

  const res = columNames + lines;
  const filename = getFileName(data.name);

  download(res, `${filename}.csv`, 'text/csv;charset=utf-8');
};

export const toXLSX_DIR = async (file: File, parsedData?: IDirData) => {

  const data = parsedData ? parsedData : await getDirectionalData(file, 'dir') as IDirData;

  const columnNames = 'id,Code,StepRange,N,Dgeo,Igeo,Dstrat,Istrat,MAD,K,Comment'.split(',');

  const lines = data.interpretations.map((interpretation: any) => {
    return Object.keys(dataModel_interpretation).map((param) => {
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

  download(res, `${filename}.xlsx`, "application/octet-stream")
};