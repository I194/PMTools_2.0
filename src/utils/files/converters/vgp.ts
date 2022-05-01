import * as XLSX from 'xlsx';
import { dataModel_interpretation } from '../fileConstants';
import { download, getDirectionalData, s2ab } from '../fileManipulations';
import { IDirData, IVGPData } from '../../GlobalTypes';
import { getFileName } from '../subFunctions';

export const toCSV_VGP = async (file: File, parsedData: IVGPData) => {
  // readonly id: number;
  // label: string;
  // lat: number;
  // lon: number;
  // poleLatitude: number,
  // poleLongitude: number,
  // paleoLatitude: number,
  // dp: number,
  // dm: number,
  const data = parsedData;
  
  const rawColumnNames = ['label', 'lat', 'lon', 'poleLatitude', 'poleLongitude', 'paleoLatitude', 'dp', 'dm', 'age', 'plateId'];
  const columnNames = ['label', 'siteLat', 'siteLon', 'poleLat', 'poleLon', 'paleoLat', 'dp', 'dm', 'age', 'plateId'];

  const lines = data.vgps.map((vgp: any) => {
    const line = rawColumnNames.reduce((line, col) => {
      return line + `${vgp[col]},`
    }, '')
    return line.slice(0, -1);
  }).join('\n');

  const res = columnNames.join(',') + '\n' + lines;
  const filename = getFileName(data.name);

  download(res, `${filename}.csv`, 'text/csv;charset=utf-8');
};

export const toXLSX_VGP = async (file: File, parsedData: IVGPData) => {

  const data = parsedData;

  const rawColumnNames = ['label', 'lat', 'lon', 'poleLatitude', 'poleLongitude', 'paleoLatitude', 'dp', 'dm', 'age', 'plateId'];
  const columnNames = ['label', 'siteLat', 'siteLon', 'poleLat', 'poleLon', 'paleoLat', 'dp', 'dm', 'age', 'plateId'];
  
  const lines = data.vgps.map((vgp: any) => {
    return rawColumnNames.map((col) => {
      return vgp[col];
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