import * as XLSX from 'xlsx';
import { dataModel_interpretation_from_dir } from '../fileConstants';
import { download, getDirectionalData, s2ab } from '../fileManipulations';
import { IDirData, IVGPData } from '../../GlobalTypes';
import { getFileName } from '../subFunctions';

export const toGPML = async (file: File, parsedData: IVGPData) => {
  const data = parsedData;
  
  const rawColumnNames = ['label', 'poleLatitude', 'poleLongitude', 'plateId', 'age', 'a95'];
  const headerXML = '<?xml version="1.0" encoding="UTF-8"?>\n'
  const headerGPML = '<gpml:FeatureCollection xmlns:gpml="http://www.gplates.org/gplates" xmlns:gml="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/XMLSchema-instance" gpml:version="1.6.0336" xsi:schemaLocation="http://www.gplates.org/gplates ../xsd/gpml.xsd http://www.opengis.net/gml ../../../gml/current/base">';
  const footerGPML = '\n</gpml:FeatureCollection>';

  const identity = 'GPlates_PMTools_2.0';
  const revision = 'GPlates_PMTools_2.0';

  const lines = data.vgps.map(vgp => {
    const gpmlIdentity = `<gpml:identity>${identity}</gpml:identity>`;
    const gpmlRevision = `<gpml:revision>${revision}</gpml:revision>`;
    const gmlName = `<gml:name>${vgp.label}</gml:name>`;
    const gmlPos = `<gml:pos>${vgp.poleLatitude} ${vgp.poleLongitude}</gml:pos>`;
    const gpmlValue = `<gpml:value>${vgp.plateId}</gpml:value>`;
    const gpmlAverageAge = `<gpml:averageAge>${vgp.age}</gpml:averageAge>`;
    const gpmlPoleA95 = `<gpml:poleA95>${vgp.a95}</gpml:poleA95>`;

    const gmlFeatureMember = `
    <gml:featureMember>
        <gpml:VirtualGeomagneticPole>
            ${gpmlIdentity}
            ${gpmlRevision}
            ${gmlName}
            <gpml:polePosition>
                <gpml:ConstantValue>
                    <gpml:value>
                        <gml:Point>
                            ${gmlPos}
                        </gml:Point>
                    </gpml:value>
                    <gml:description></gml:description>
                    <gpml:valueType xmlns:gml="http://www.opengis.net/gml">gml:Point</gpml:valueType>
                </gpml:ConstantValue>
            </gpml:polePosition>
            <gpml:reconstructionPlateId>
                <gpml:ConstantValue>
                    ${gpmlValue}
                    <gml:description></gml:description>
                    <gpml:valueType xmlns:gpml="http://www.gplates.org/gplates">gpml:plateId</gpml:valueType>
                </gpml:ConstantValue>
            </gpml:reconstructionPlateId>
            ${gpmlAverageAge}
            ${gpmlPoleA95}
        </gpml:VirtualGeomagneticPole>
    </gml:featureMember>`;
    return gmlFeatureMember;
  }).join('');

  const res = headerXML + headerGPML + lines + footerGPML;
  const filename = getFileName(data.name);

  download(res, `${filename}.gpml`, 'text/csv;charset=utf-8');
};

export const toVGP = async (file: File, parsedData: IVGPData) => {
  const data = parsedData;
  
  const rawColumnNames = ['label', 'dec', 'inc', 'a95', 'lat', 'lon', 'poleLatitude', 'poleLongitude', 'dp', 'dm', 'age'];

  const lines = data.vgps.map((vgp: any) => {
    const line = rawColumnNames.reduce((line, col) => {
      if (col === 'label') return line + `${vgp[col]}\r\n`;
      return line + `"${Number(vgp[col]).toFixed(2)}"\r\n`;
    }, '')
    return line.slice(0, -1);
  }).join('\n');

  const res = lines;
  const filename = getFileName(data.name);

  download(res, `${filename}.vgp`, 'text/csv;charset=utf-8');
};

export const toCSV_VGP = async (file: File, parsedData: IVGPData) => {
  const data = parsedData;
  
  const rawColumnNames = ['label', 'dec', 'inc', 'a95', 'lat', 'lon', 'poleLatitude', 'poleLongitude', 'paleoLatitude', 'dp', 'dm', 'age', 'plateId'];
  const columnNames = ['label', 'dec', 'inc', 'a95', 'siteLat', 'siteLon', 'poleLat', 'poleLon', 'paleoLat', 'dp', 'dm', 'age', 'plateId'];

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

  const rawColumnNames = ['label', 'dec', 'inc', 'a95', 'lat', 'lon', 'poleLatitude', 'poleLongitude', 'paleoLatitude', 'dp', 'dm', 'age', 'plateId'];
  const columnNames = ['label', 'dec', 'inc', 'a95', 'siteLat', 'siteLon', 'poleLat', 'poleLon', 'paleoLat', 'dp', 'dm', 'age', 'plateId'];
  
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