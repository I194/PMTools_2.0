import parseDIR from '../parsers/parserDIR';
import parsePMM from '../parsers/parserPMM';
import parseCSV_DIR from '../parsers/parserCSV_DIR';
import parseXLSX_DIR from '../parsers/parserXLSX_DIR';
import parsePMD from '../parsers/parserPMD';
import parseCSV_PMD from '../parsers/parserCSV_PMD';
import parseXLSX_PMD from '../parsers/parserXLSX_PMD';
import parseCSV_SitesLatLon from '../parsers/parserCSV_SitesLatLon';
import parseXLSX_SitesLatLon from '../parsers/parserXLSX_SitesLatLon';
import parseSQUID from '../parsers/parserSQUID';
import parserRS3 from '../parsers/parserRS3';
import parseMDIR from '../parsers/parserMDIR';
import { IDirData, IPmdData } from '../../GlobalTypes';
import { ParseResult } from '../validation';

const wrapPlain = <T>(data: T): ParseResult<T> => ({
  data,
  validation: { invalidRows: [] },
});

export default class PMFile {
  name: string;
  type: string;
  size: number;
  path: string;
  data: string | ArrayBuffer | null;

  constructor(
    name: string,
    type: string,
    size: number,
    path: string,
    data: string | ArrayBuffer | null,
  ) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.path = path;
    this.data = data;
  }

  parsePMD = (): ParseResult<IPmdData> => parsePMD(this.data as string, this.name);
  parseSQUID = (): ParseResult<IPmdData> => wrapPlain(parseSQUID(this.data as string, this.name));
  parseRS3 = (): ParseResult<IPmdData> => wrapPlain(parserRS3(this.data as string, this.name));
  parseCSV_PMD = (): ParseResult<IPmdData> =>
    wrapPlain(parseCSV_PMD(this.data as string, this.name));
  parseXLSX_PMD = (): ParseResult<IPmdData> =>
    wrapPlain(parseXLSX_PMD(this.data as ArrayBuffer, this.name));
  parsePMM = (): ParseResult<IDirData> => wrapPlain(parsePMM(this.data as string, this.name));
  parseDIR = (): ParseResult<IDirData> => parseDIR(this.data as string, this.name);
  parseMDIR = (): ParseResult<IDirData> => wrapPlain(parseMDIR(this.data as string, this.name));
  parseCSV_DIR = (): ParseResult<IDirData> =>
    wrapPlain(parseCSV_DIR(this.data as string, this.name));
  parseXLSX_DIR = (): ParseResult<IDirData> =>
    wrapPlain(parseXLSX_DIR(this.data as ArrayBuffer, this.name));
  parseCSV_SitesLatLon = () => parseCSV_SitesLatLon(this.data as string, this.name);
  parseXLSX_SitesLatLon = () => parseXLSX_SitesLatLon(this.data as ArrayBuffer, this.name);
}
