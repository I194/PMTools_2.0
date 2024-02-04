import React, { FC } from "react";
import CurrentPMDFileSelector from "../ToolsPMD/CurrentPMDFileSelector";
import CurrentDIRFileSelector from "../ToolsDIR/CurrentDIRFileSelector";

interface ICurrentFileSelector {
  currentPage: string;
};

const CurrentFileSelector: FC<ICurrentFileSelector> = ({
  currentPage,
}) => {
  if (currentPage === 'pca') {
    return <CurrentPMDFileSelector />
  }

  if (currentPage === 'dir') {
    return <CurrentDIRFileSelector />
  }

  return null;
}

export default CurrentFileSelector;
