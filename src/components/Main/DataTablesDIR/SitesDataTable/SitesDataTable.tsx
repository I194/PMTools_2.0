import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from './SitesDataTable.module.scss';
import { useAppDispatch, useAppSelector } from "../../../../services/store/hooks";
import { GetDataTableBaseStyle } from "../styleConstants";
import SitesDataTableSkeleton from './SitesDataTableSkeleton';
import { IDirData, ISitesData, VGPData } from "../../../../utils/GlobalTypes";
import { 
  DataGrid, 
  GridColumns, 
  GridEditRowsModel,
  GridValueFormatterParams, 
} from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { Button } from "@mui/material";
import SitesInputDataTableToolbar from "../../../Sub/DataTable/Toolbar/SitesInputDataTableToolbar";
import calculateVGP from "../../../../utils/statistics/calculation/calculateVGP";
import useApiRef from "../useApiRef";
import { setVGPData } from "../../../../services/reducers/dirPage";
import { setSiteLatLonData } from "../../../../services/reducers/parsedData";
import { textColor } from "../../../../utils/ThemeConstants";

type SiteRow = {
  id: number;
  label: string;
  index: number | string;
  lat: number;
  lon: number;
  age: number;
  plateId: number;
};

interface IDataTableDIR {
  data: IDirData | null;
};


const SitesDataTable: FC<IDataTableDIR> = ({ data }) => {
  
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { selectedDirectionsIDs, hiddenDirectionsIDs, reference } = useAppSelector(state => state.dirPageReducer);
  const { siteData } = useAppSelector(state => state.parsedDataReducer);
  const [siteVGPData, setSiteVGPData] = useState<ISitesData['data']>([]);
  const [editRowsModel, setEditRowsModel] = useState<GridEditRowsModel>({});

  useEffect(() => {
    if (siteData) setSiteVGPData(siteData.data);
  }, [siteData])

  const handleEditRowsModelChange = useCallback((model: GridEditRowsModel) => {
    setEditRowsModel(model);
  }, []);

  const columns: GridColumns = [
    { field: 'id', headerName: 'ID', type: 'string', width: 30 },
    { field: 'index', headerName: '№', type: 'string', width: 30 },
    { field: 'label', headerName: 'Label', type: 'string', width: 80 },
    { field: 'lat', headerName: 'Lat', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'lon', headerName: 'Lon', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'age', headerName: 'age', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'plateId', headerName: 'plate ID', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(0)
    },
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });
  
  const { apiRef, enhancedColumns } = useApiRef(columns);

  if (!data) return <SitesDataTableSkeleton />;

  let visibleIndex = 1;
  const rows: Array<SiteRow> = data.interpretations.map((interpretation, index) => {
    const { id, label } = interpretation;
    return {
      id,
      index: hiddenDirectionsIDs.includes(id) ? '-' : visibleIndex++,
      label,
      lat: siteVGPData ? siteVGPData[index]?.lat : 0,
      lon: siteVGPData ? siteVGPData[index]?.lon : 0,
      age: siteVGPData ? siteVGPData[index]?.age : 0,
      plateId: siteVGPData ? siteVGPData[index]?.plateId : 0,
    };
  });

  const calculateVGPs = () => {
    const rows: Array<SiteRow> = Array.from(apiRef?.current?.getRowModels()?.values() || []);
    if (!rows.length) return;
    const vgpData: VGPData = rows.map((row, index) => {
      let { id, label, lat, lon, age, plateId } = row;
      // на случай, если были загружены данные из файла и не обновился apiRef
      if ((lat === 0 || lon === 0) && siteVGPData && siteVGPData[index]) {
        lat = siteVGPData[index].lat;
        lon = siteVGPData[index].lon;
        age = siteVGPData[index].age;
        plateId = siteVGPData[index].plateId;
      };
      console.log(age, plateId)
      const interpretation = data.interpretations.find(interpretation => interpretation.id === id)!;
      const dec = reference === 'geographic' ? interpretation.Dgeo : interpretation.Dstrat;
      const inc = reference === 'geographic' ? interpretation.Igeo : interpretation.Istrat;
      const a95 = interpretation.mad;
      const vgp = calculateVGP(dec, inc, a95, lat, lon);
      return {
        id,
        label,
        lat,
        lon,
        age,
        plateId,
        ...vgp
      }
    });
    dispatch(setVGPData(vgpData));
  };

  const deleteData = () => {
    dispatch(setVGPData(null));
    dispatch(setSiteLatLonData(null));
  };

  return (
    <div className={styles.container}>
      <SitesDataTableSkeleton>
        <DataGrid 
          rows={rows} 
          columns={enhancedColumns} 
          // columnVisibilityModel={{
          //   hideMe: false
          // }}
          editRowsModel={editRowsModel}
          onEditRowsModelChange={handleEditRowsModelChange}
          sx={{
            ...GetDataTableBaseStyle(),
            '& .MuiDataGrid-cell': {
              padding: '0px 0px',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: '0px 0px',
              minWidth: '0px!important',
            }
          }}
          hideFooter={true}
          density={'compact'}
          components={{
            Toolbar: SitesInputDataTableToolbar,
          }}
          disableSelectionOnClick={true}
        />
      </SitesDataTableSkeleton>
      <div className={styles.buttons}>
        <Button
          variant="outlined"
          onClick={deleteData}
          sx={{
            textTransform: 'none', 
            marginTop: '16px',
            color: textColor(theme.palette.mode),
          }}
        >  
          Очистить данные
        </Button>
        <Button
          variant="contained"
          onClick={calculateVGPs}
          sx={{
            textTransform: 'none', 
            marginTop: '16px',
          }}
        >  
          Рассчитать VGP
        </Button>
      </div>
    </div>
    
  );
};

export default SitesDataTable;
