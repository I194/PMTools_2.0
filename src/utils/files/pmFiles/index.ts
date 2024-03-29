import parseDIR from "../parsers/parserDIR";
import parsePMM from "../parsers/parserPMM";
import parseCSV_DIR from "../parsers/parserCSV_DIR";
import parseXLSX_DIR from "../parsers/parserXLSX_DIR";
import parsePMD from "../parsers/parserPMD";
import parseCSV_PMD from "../parsers/parserCSV_PMD";
import parseXLSX_PMD from "../parsers/parserXLSX_PMD";
import parseCSV_SitesLatLon from "../parsers/parserCSV_SitesLatLon";
import parseXLSX_SitesLatLon from "../parsers/parserXLSX_SitesLatLon";
import parseSQUID from "../parsers/parserSQUID";
import parserRS3 from "../parsers/parserRS3";
import parseMDIR from "../parsers/parserMDIR";

export default class PMFile {
  name: string;
  type: string;
  size: number;
  path: string;
  data: string | ArrayBuffer | null;

  constructor (
    name: string, 
    type: string, 
    size: number, 
    path: string, 
    data: string | ArrayBuffer | null
  ) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.path = path;
    this.data = data;
  }

  parsePMD = () => parsePMD(this.data as string, this.name);
  parseSQUID = () => parseSQUID(this.data as string, this.name);
  parseRS3 = () => parserRS3(this.data as string, this.name);
  parseCSV_PMD = () => parseCSV_PMD(this.data as string, this.name);
  parseXLSX_PMD = () => parseXLSX_PMD(this.data as ArrayBuffer, this.name);
  parsePMM = () => parsePMM(this.data as string, this.name);
  parseDIR = () => parseDIR(this.data as string, this.name);
  parseMDIR = () => parseMDIR(this.data as string, this.name);
  parseCSV_DIR = () => parseCSV_DIR(this.data as string, this.name);
  parseXLSX_DIR = () => parseXLSX_DIR(this.data as ArrayBuffer, this.name);
  parseCSV_SitesLatLon = () => parseCSV_SitesLatLon(this.data as string, this.name);
  parseXLSX_SitesLatLon = () => parseXLSX_SitesLatLon(this.data as ArrayBuffer, this.name);

}