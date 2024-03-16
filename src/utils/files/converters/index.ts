import { toPMD, toCSV_PMD, toXLSX_PMD } from "./pmd";
import { toDIR, toPMM, toCSV_DIR, toXLSX_DIR } from "./dir";
import { toGPML, toVGP, toCSV_VGP, toXLSX_VGP } from "./vgp";

export {
  toPMD, toCSV_PMD, toXLSX_PMD,
  toDIR, toPMM, toCSV_DIR, toXLSX_DIR,
  toGPML, toVGP, toCSV_VGP, toXLSX_VGP
};

// This way we provide the global methods
(window as any).toPMD = toPMD;
(window as any).toDIR = toDIR;
(window as any).toPMM = toPMM;
(window as any).toGPML = toGPML;
(window as any).toVGP = toVGP;
(window as any).toCSV_DIR = toCSV_DIR;
(window as any).toXLSX_DIR = toXLSX_DIR;
(window as any).toCSV_PMD = toCSV_PMD;
(window as any).toXLSX_PMD = toXLSX_PMD;
(window as any).toCSV_VGP = toCSV_VGP;
(window as any).toXLSX_VGP = toXLSX_VGP;

