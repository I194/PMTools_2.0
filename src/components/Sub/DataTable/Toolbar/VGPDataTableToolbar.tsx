import { 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useAppSelector } from "../../../../services/store/hooks";
import { IVGPData } from "../../../../utils/GlobalTypes"; 
import ExportVGP from "./Buttons/ExportButton/ExportVGP";

const VGPDataTableToolbar = () => {

  const { vgpData } = useAppSelector(state => state.dirPageReducer);

  if (!vgpData) return null;

  const data: IVGPData = {
    name: 'vgp_data',
    vgps: vgpData,
    format: '',
    created: ''
  };

  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <ExportVGP data={data}/>
    </GridToolbarContainer>
  );
};

export default VGPDataTableToolbar;
