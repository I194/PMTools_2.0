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
import { setSiteData } from "../../../../services/reducers/parsedData";
import { textColor } from "../../../../utils/ThemeConstants";
import Direction from "../../../../utils/graphs/classes/Direction";
import { useTranslation } from "react-i18next";

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
  // sitesData?: ISitesData['data'];
};


const SitesDataTable: FC<IDataTableDIR> = ({ data }) => {
  
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { t, i18n } = useTranslation('translation');

  const { hiddenDirectionsIDs, reversedDirectionsIDs, reference } = useAppSelector(state => state.dirPageReducer);
  const sitesData = useAppSelector(state => state.parsedDataReducer.siteData)?.data;

  const columns: GridColumns = [
    { field: 'id', headerName: 'ID', type: 'string', minWidth: 20, width: 30 },
    { field: 'index', headerName: '№', type: 'string', minWidth: 20, width: 30 },
    { field: 'label', headerName: 'Label', type: 'string', width: 70 },
    { field: 'lat', headerName: 'Lat', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'lon', headerName: 'Lon', type: 'number', flex: 1, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'age', headerName: 'age', type: 'number', width: 70, editable: true, 
      cellClassName: styles[`editableCell_${theme.palette.mode}`],
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'plateId', headerName: 'plate ID', type: 'number', width: 70, editable: true, 
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
      lat: sitesData ? sitesData[index]?.lat || 0 : 0,
      lon: sitesData ? sitesData[index]?.lon || 0 : 0,
      age: sitesData ? sitesData[index]?.age || 0 : 0,
      plateId: sitesData ? sitesData[index]?.plateId || 0 : 0,
    };
  });

  const calculateVGPs = () => {
    const rows: Array<SiteRow> = Array.from(apiRef?.current?.getRowModels()?.values() || []);
    if (!rows.length) return;
    const visibleRows = rows.filter(row => !hiddenDirectionsIDs.includes(row.id));
    const vgpData: VGPData = visibleRows.map((row, index) => {
      // let [id, label] = [0, ''];
      // let [lat, lon, age, plateId] = [0, 0, 0, 0];
      let { id, label, lat, lon, age, plateId } = row;
      // на случай, если были загружены данные из файла и не обновился apiRef
      // if ((lat === 0 || lon === 0 || age === 0 || plateId === 0) && sitesData && sitesData[index]) {
      //   lat = sitesData[index].lat;
      //   lon = sitesData[index].lon;
      //   age = sitesData[index].age;
      //   plateId = sitesData[index].plateId;
      // };
      const interpretation = data.interpretations.find(interpretation => interpretation.id === id)!;
      // учёт перевернутых направлений
      const { Dgeo, Igeo, Dstrat, Istrat } = interpretation;
      let geoDirection = new Direction(Dgeo, Igeo, 1);
      let stratDirection = new Direction(Dstrat, Istrat, 1);
      if (reversedDirectionsIDs.includes(id)) {
        geoDirection = geoDirection.reversePolarity();
        stratDirection = stratDirection.reversePolarity();
      };
      const DgeoFinal = +geoDirection.declination.toFixed(1);
      const IgeoFinal = +geoDirection.inclination.toFixed(1);
      const DstratFinal = +stratDirection.declination.toFixed(1);
      const IstratFinal = +stratDirection.inclination.toFixed(1);
      // итоговые данные для расчёта vgp
      const dec = reference === 'geographic' ? DgeoFinal : DstratFinal;
      const inc = reference === 'geographic' ? IgeoFinal : IstratFinal;
      const a95 = reference === 'geographic' ? interpretation.MADgeo : interpretation.MADstrat;
      const vgp = calculateVGP(dec, inc, lat, lon, a95);
      const dp: number = vgp?.dp || 0;
      const dm: number = vgp?.dm || 0;
      return {
        id,
        label,
        dec,
        inc,
        a95,
        lat,
        lon,
        age,
        plateId,
        ...vgp,
        dp,
        dm
      }
    });
    const newSitesData: ISitesData['data'] = [...rows];
    console.log('new vgp and site data', vgpData, newSitesData);
    dispatch(setVGPData(vgpData));
    dispatch(setSiteData(newSitesData));
  };

  const deleteData = () => {
    dispatch(setVGPData(null));
    dispatch(setSiteData(null));
  };

  return (
    <div className={styles.container}>
      <SitesDataTableSkeleton>
        <DataGrid 
          rows={rows} 
          columns={enhancedColumns} 
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
          hideFooter={rows.length < 100}
          density={'compact'}
          components={{
            Toolbar: SitesInputDataTableToolbar,
          }}
          disableSelectionOnClick={true}
          getRowClassName={
            (params) =>  hiddenDirectionsIDs.includes(params.row.id) ? styles.hiddenRow : ''
          }
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
          {t("vgp.dataManipulation.clear")}
        </Button>
        <Button
          variant="contained"
          onClick={calculateVGPs}
          sx={{
            textTransform: 'none', 
            marginTop: '16px',
          }}
        >  
          {t("vgp.dataManipulation.calculate")}
        </Button>
      </div>
    </div>
    
  );
};

export default SitesDataTable;
