import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDirectionalData, getSitesLatLonData } from "../../utils/files/fileManipulations";

type TFilesToData = {
  files: File[];
  format: 'pmd' | 'squid' | 'rs3' | 'dir' | 'pmm' | 'csv' | 'xlsx';
};

export const filesToData = createAsyncThunk(
  'filesAndData/filesToData', 
  async function ({ files, format }: TFilesToData, { rejectWithValue }) {
    try {
      const results = await Promise.allSettled(files.map((file) => getDirectionalData(file, format)));
      const fulfilled = results.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').map(r => r.value);
      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

      // Optionally, inform about skipped files without failing the whole batch
      if (rejected.length > 0) {
        try {
          const skippedNames = results
            .map((r, i) => ({ r, i }))
            .filter(({ r }) => r.status === 'rejected')
            .map(({ i }) => files[i]?.name)
            .filter(Boolean) as string[];
          if (skippedNames.length) {
            // Non-blocking user notification; keep minimal to avoid UI dependency
            // eslint-disable-next-line no-alert
            alert(`Some files were skipped:\n${skippedNames.join('\n')}`);
          }
        } catch (_) {
          // ignore any alert errors (e.g., server-side)
        }
      }

      return { format, data: fulfilled };
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const sitesFileToLatLon = createAsyncThunk(
  'filesAndData/sitesFileToLatLon',
  async function (file: File, { rejectWithValue }) {
    try {
      const res = await getSitesLatLonData(file);
      return res;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);