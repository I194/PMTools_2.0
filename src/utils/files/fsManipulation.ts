import { any } from "numeric";
import { getNewFileHandle, writeFile } from "./fsAPIHelpers";
// переписать всё это на один класс - FSManager и в него всё аккуратно упаковать
// info: https://web.dev/file-system-access/
// info: https://github.com/GoogleChromeLabs/text-editor/
// info: https://web.dev/learn/pwa/os-integration/
// info: https://dev.to/ndesmic/building-a-pwa-music-player-part-1-file-system-api-4nf6
interface FSManager {
  appName: string;
  hasFSAccess: boolean;
  isMac: boolean;
  saveFileAs?: () => void;
}

export const fsManager: FSManager = {
  appName: 'PMTools',
  hasFSAccess: 'chooseFileSystemEntries' in window ||
               'showOpenFilePicker' in window,
  isMac: navigator.userAgent.includes('Mac OS X'),
};

/**
 * Saves a new file to disk.
 */
// fsManager.saveFileAs = async () => {
//   if (!fsManager.hasFSAccess) {
//     fsManager.saveAsLegacy(fsManager.file.name, fsManager.getText());
//     fsManager.setFocus();
//     return;
//   }
//   let fileHandle;
//   try {
//     fileHandle = await getNewFileHandle();
//   } catch (ex) {
//     if (ex.name === 'AbortError') {
//       return;
//     }
//     const msg = 'An error occured trying to open the file.';
//     console.error(msg, ex);
//     alert(msg);
//     return;
//   }
//   try {
//     await writeFile(fileHandle, fsManager.getText());
//     fsManager.setFile(fileHandle);
//     fsManager.setModified(false);
//   } catch (ex) {
//     const msg = 'Unable to save file.';
//     console.error(msg, ex);
//     alert(msg);
//     return;
//   }
//   fsManager.setFocus();
// };