import PMFile from "./pmFiles";
import { exampleDir } from "./fileConstants";
import { IDirData, IPmdData } from "../GlobalTypes";

export const getDirectionalData = (file: File, as: string) => {

  const ext = (/[.]/.exec(file.name)) ? /[^.]+$/.exec(file.name)?.toString().toLowerCase() : undefined;

  return new Promise<IPmdData | IDirData>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {

      const handleRawData = (rawData: string | ArrayBuffer | null) => {
        const pmFile = new PMFile(file.name, file.type, file.size, file.webkitRelativePath, rawData);
        console.log(ext)
        switch (ext) {
          case 'pmd': return pmFile.parsePMD();
          case 'dir': return pmFile.parseDIR();
          case 'pmm': return pmFile.parsePMM();
          case 'csv': {
            if (as === 'pmd') return pmFile.parseCSV_PMD();
            if (as === 'dir') return pmFile.parseCSV_DIR();
            return exampleDir;
          }
          case 'xlsx': {
            if (as === 'pmd') return pmFile.parseXLSX_PMD();
            if (as === 'dir') return pmFile.parseXLSX_DIR();
            return exampleDir;
          }
          default: return exampleDir;
        }
      }

      resolve(handleRawData(reader.result));

    };

    reader.onerror = reject;
  
    ext === 'xlsx' ? reader.readAsArrayBuffer(file) : reader.readAsText(file);   
  })

}

export const s2ab = (s: string) => { 
  const buf = new ArrayBuffer(s.length); // Convert s to arrayBuffer
  const view = new Uint8Array(buf);  // Create uint8array as viewer
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; // Convert to octet - excel can read only octet (2^8) data
  return buf;    
}

// Function to download data to a file
export const download = (data: string | ArrayBuffer, filename: string, type: string) => {
  const file = new Blob([data], {type: type});
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);  
  }, 0); 
}