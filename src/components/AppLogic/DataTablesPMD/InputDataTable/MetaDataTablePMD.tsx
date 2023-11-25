import React, { FC, useState } from "react";
import { IPmdData } from "../../../../utils/GlobalTypes";
import { DataGrid, GridActionsCellItem, GridColDef, GridColumns, GridEditRowsModel, GridEventListener, GridEvents, GridRowParams, GridValueFormatterParams, MuiEvent, useGridApiRef } from '@mui/x-data-grid';
import MetaDataTablePMDSkeleton from './MetaDataTablePMDSkeleton';
import { GetDataTableBaseStyle } from "../styleConstants";
import EditIcon from '@mui/icons-material/Edit';
import MetaDataChange from "../../../Common/DataTable/MetaDataChange/MetaDataChange";
import ModalWrapper from "../../../Common/Modal/ModalWrapper";
import { useMediaQuery } from "react-responsive";

interface IMetaDataTablePMD {
  data: IPmdData['metadata'] | null | undefined;
};

const MetaDataTablePMD: FC<IMetaDataTablePMD> = ({ data}) => {

  const widthLessThan1400 = useMediaQuery({ query: '(max-width: 1400px)' });
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const columns: GridColumns = [
    { field: 'name', headerName: 'Name', type: 'string', flex: 1 },
    { field: 'a', headerName: 'Core Azimuth', type: 'number', flex: 1, 
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'b', headerName: 'Core Dip', 
      description: 'Core hade is measured, but here used the plunge (90 - hade)', type: 'number', flex: 1, 
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 's', headerName: 'Bedding Strike', type: 'number', flex: 1, 
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'd', headerName: 'Bedding Dip', type: 'number', flex: 1, 
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toFixed(1)
    },
    { field: 'v', headerName: 'Volume', type: 'number', flex: 1, 
      valueFormatter: (params: GridValueFormatterParams) => (params.value as number)?.toExponential(2).toUpperCase()
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Edit',
      width: 40,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => setShowEditModal(true)}
            color="inherit"
          />,
        ];
      },
    }
  ];

  columns.forEach((col) => {
    col.align = 'center';
    col.headerAlign = 'center';
    col.hideSortIcons = true;
    col.disableColumnMenu = true;
  });

  const rows = [{...data, id: 0, isRowSelectable: false}];

  if (!data) return <MetaDataTablePMDSkeleton />;

  return (
    <>
      <MetaDataTablePMDSkeleton>
        <DataGrid 
          rows={rows} 
          columns={columns} 
          hideFooter={rows.length < 100}
          autoHeight={true}
          getRowHeight={() => 30}
          density={'compact'}
          disableSelectionOnClick={true}
          sx={{
            ...GetDataTableBaseStyle(),
            '& .MuiDataGrid-columnHeaders': {
              minHeight: '24px!important',
              maxHeight: '24px!important',
              lineHeight: '24px!important',
            },
            '& .MuiDataGrid-virtualScroller': {
              marginTop: '24px!important',
            },
            '& .MuiDataGrid-cell': {
              padding: '0px 0px',
            },
            '& .MuiDataGrid-columnHeader': {
              padding: '0px 0px',
            }
          }}
        />
      </MetaDataTablePMDSkeleton>
      {
        showEditModal && 
        <ModalWrapper
          open={showEditModal}
          setOpen={setShowEditModal}
          size={{
            height: widthLessThan1400 ? '54vh' : '36vh'
          }}
        >
          <MetaDataChange oldMetadata={data} onApply={() => setShowEditModal(false)}/>
        </ModalWrapper>
      }
    </>
  );
};

export default MetaDataTablePMD;
