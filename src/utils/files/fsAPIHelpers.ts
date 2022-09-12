 /* exported getFileHandle, getNewFileHandle, readFile, verifyPermission,
             writeFile */
 
 /**
  * Open a handle to an existing file on the local file system.
  *
  * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
  */
export function getFileHandle(): Promise<FileSystemFileHandle> {
  // For Chrome 86 and later...
  if ('showOpenFilePicker' in window) {
  // @ts-ignore: experimental API
    return window?.showOpenFilePicker().then((handles) => handles[0]);
  }
  // For Chrome 85 and earlier...
  // @ts-ignore: experimental API
  return window?.chooseFileSystemEntries();
}
 
 /**
  * Create a handle to a new (svg) file on the local file system.
  *
  * @return {!Promise<FileSystemFileHandle>} Handle to the new file.
  */
export function getNewFileHandle(): Promise<FileSystemFileHandle> {
  // For Chrome 86 and later...
  if ('showSaveFilePicker' in window) {
    const opts = {
      suggestedName: 'PMTools graph.svg',
      types: [{
        description: 'Scalable Vector Graphics',
        accept: {'image/svg+xml': ['.svg']},
      }],
    };
    // @ts-ignore: experimental API
    return window?.showSaveFilePicker(opts);
  }
  // For Chrome 85 and earlier...
  const opts = {
    type: 'save-file',
    accepts: [{
      description: 'Scalable Vector Graphics',
      extensions: ['svg'],
      mimeTypes: ['image/svg+xml'],
    }],
  };
  // @ts-ignore: experimental API
  return window?.chooseFileSystemEntries(opts);
}
 
 /**
  * Reads the raw text from a file.
  *
  * @param {File} file
  * @return {!Promise<string>} A promise that resolves to the parsed string.
  */
//  function readFile(file) {
//    // If the new .text() reader is available, use it.
//    if (file.text) {
//      return file.text();
//    }
//    // Otherwise use the traditional file reading technique.
//    return _readFileLegacy(file);
//  }
 
 /**
  * Reads the raw text from a file.
  *
  * @private
  * @param {File} file
  * @return {Promise<string>} A promise that resolves to the parsed string.
  */
//  function _readFileLegacy(file) {
//    return new Promise((resolve) => {
//      const reader = new FileReader();
//      reader.addEventListener('loadend', (e) => {
//        const text = e.srcElement.result;
//        resolve(text);
//      });
//      reader.readAsText(file);
//    });
//  }
 
 /**
  * Writes the contents to disk.
  *
  * @param {FileSystemFileHandle} fileHandle File handle to write to.
  * @param {string} contents Contents to write.
  */
export async function writeFile(fileHandle: FileSystemFileHandle, contents: string) {
  // Support for Chrome 82 and earlier.
  // @ts-ignore: experimental API
  if (fileHandle.createWriter) {
    // Create a writer (request permission if necessary).
     // @ts-ignore: experimental API
    const writer = await fileHandle?.createWriter();
    // Write the full length of the contents
    await writer?.write(0, contents);
    // Close the file and write the contents to disk
    await writer?.close();
    return;
  }
  // For Chrome 83 and later.
  // Create a FileSystemWritableFileStream to write to.
  // @ts-ignore: experimental API
  const writable = await fileHandle?.createWritable();
  // Write the contents of the file to the stream.
  await writable?.write(contents);
  // Close the file and write the contents to disk.
  await writable?.close();
}

 /**
  * Verify the user has granted permission to read or write to the file, if
  * permission hasn't been granted, request permission.
  *
  * @param {FileSystemFileHandle} fileHandle File handle to check.
  * @param {boolean} withWrite True if write permission should be checked.
  * @return {boolean} True if the user has granted read/write permission.
  */
export async function verifyPermission(fileHandle: FileSystemFileHandle, withWrite: boolean) {
  const opts: {writable?: boolean, mode?: string} = {};
  if (withWrite) {
    opts.writable = true;
    // For Chrome 86 and later...
    opts.mode = 'readwrite';
  }
  // Check if we already have permission, if so, return true.
  // @ts-ignore: experimental API
  if (await fileHandle?.queryPermission(opts) === 'granted') {
    return true;
  }
  // Request permission to the file, if the user grants permission, return true.
  // @ts-ignore: experimental API
  if (await fileHandle?.requestPermission(opts) === 'granted') {
    return true;
  }
  // The user did nt grant permission, return false.
  return false;
}