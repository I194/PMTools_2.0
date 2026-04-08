import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDirectionalData, getSitesLatLonData } from '../../utils/files/fileManipulations';
import { FileValidationIssue } from '../../utils/files/validation';

type MergeMode = {
  enabled: true;
  name: string;
  alsoLoadSeparately?: boolean;
};

type TFilesToData = {
  files: File[];
  format: 'pmd' | 'squid' | 'rs3' | 'dir' | 'pmm' | 'csv' | 'xlsx';
  mergeMode?: MergeMode;
};

export const filesToData = createAsyncThunk(
  'filesAndData/filesToData',
  async function ({ files, format, mergeMode }: TFilesToData, { rejectWithValue }) {
    try {
      const results = await Promise.allSettled(
        files.map((file) => getDirectionalData(file, format)),
      );
      const fulfilled = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map((r) => r.value);
      const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

      if (rejected.length > 0) {
        try {
          const skippedInfo = results
            .map((r, i) => ({ r, i }))
            .filter(({ r }) => r.status === 'rejected')
            .map(({ r, i }) => {
              const name = files[i]?.name ?? 'unknown';
              const reason = (r as PromiseRejectedResult).reason;
              const message = reason instanceof Error ? reason.message : String(reason);
              return `${name}: ${message}`;
            });
          if (skippedInfo.length) {
            // eslint-disable-next-line no-alert
            alert(`Some files were skipped:\n\n${skippedInfo.join('\n')}`);
          }
        } catch (_) {
          // ignore any alert errors (e.g., server-side)
        }
      }

      // Separate data from validation info
      const data = fulfilled.map((r) => r.data);
      const validationIssues: FileValidationIssue[] = [];

      for (const result of fulfilled) {
        if (result.validation.invalidRows.length > 0) {
          const fileName = result.validation.invalidRows[0].fileName;
          const pmdData = result.data as any;
          const totalRows =
            (pmdData.steps?.length ?? pmdData.interpretations?.length ?? 0) +
            result.validation.invalidRows.length;
          const validRows = totalRows - result.validation.invalidRows.length;

          validationIssues.push({
            fileName,
            invalidRows: result.validation.invalidRows,
            totalRows,
            validRows,
          });
        }
      }

      return { format, data, validationIssues, mergeMode };
    } catch (error: any) {
      return rejectWithValue(error);
    }
  },
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
  },
);
