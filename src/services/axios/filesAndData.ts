import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDirectionalData } from "../../utils/files/fileManipulations";

type TFilesToData = {
  files: File[];
  format: 'pmd' | 'dir';
};

export const filesToData = createAsyncThunk(
  'filesAndData/filesToData', 
  async function ({ files, format }: TFilesToData, { rejectWithValue }) {
    try {
      const res = await Promise.all(files.map((file) => getDirectionalData(file, format)));
      return {format, data: res};
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);