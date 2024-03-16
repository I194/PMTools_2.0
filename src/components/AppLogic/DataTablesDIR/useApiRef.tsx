import { GridColumns } from "@mui/x-data-grid";
import React, { useMemo, useRef } from "react";

const useApiRef = (columns: GridColumns) =>{
  const apiRef = useRef<any>(null);
  const _columns = useMemo(
    () =>
      columns.concat({
        field: "",
        width: 0,
        minWidth: 0,
        maxWidth: 0,
        flex: 1,
        // hide: true,
        renderCell: (params) => {
          apiRef.current = params.api;
          return null;
        }
      }),
    [columns]
  );

  return { apiRef, enhancedColumns: _columns };
}

export default useApiRef;
