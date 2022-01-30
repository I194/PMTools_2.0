import { toPMD, toCSV_PMD, toXLSX_PMD } from "./pmd";
import { toDIR, toPMM, toCSV_DIR, toXLSX_DIR } from "./dir";

export {
  toPMD,
  toDIR, toPMM,
  toCSV_DIR, toXLSX_DIR
};

(window as any).toPMD = toPMD;
(window as any).toDIR = toDIR;
(window as any).toPMM = toPMM;
(window as any).toCSV_DIR = toCSV_DIR;
(window as any).toXLSX_DIR = toXLSX_DIR;
(window as any).toCSV_PMD = toCSV_PMD;
(window as any).toXLSX_PMD = toXLSX_PMD;