import parseDIR from "../parsers/parserDIR";
import parsePMM from "../parsers/parserPMM";
import parseCSV_DIR from "../parsers/parserCSV_DIR";
import parseXLSX_DIR from "../parsers/parserXLSX_DIR";
import parsePMD from "../parsers/parserPMD";
import parseCSV_PMD from "../parsers/parserCSV_PMD";
import parseXLSX_PMD from "../parsers/parserXLSX_PMD";

export default class PMFile {

  name;
  type;
  size;
  path;
  data;

  constructor(name: string, type: string, size: number, path: string, data: string | ArrayBuffer | null) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.path = path;
    this.data = data;
  }

  parsePMD = () => parsePMD(this.data as string, this.name);
  parseCSV_PMD = () => parseCSV_PMD(this.data as string, this.name);
  parseXLSX_PMD = () => parseXLSX_PMD(this.data as ArrayBuffer, this.name);
  parsePMM = () => parsePMM(this.data as string, this.name);
  parseDIR = () => parseDIR(this.data as string, this.name);
  parseCSV_DIR = () => parseCSV_DIR(this.data as string, this.name);
  parseXLSX_DIR = () => parseXLSX_DIR(this.data as ArrayBuffer, this.name);

}