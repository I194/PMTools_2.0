import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useAppSelector } from '../services/store/hooks';
import { GraphSettings, TMenuItem } from './graphs/types';

export const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.onresize = () => updateSize();
    updateSize();
  }, []);
  return size;
};

export const usePMDGraphSettings = () => {
  const [tooltips, setTooltips] = useState<boolean>(true);
  const [ticks, setTicks] = useState<boolean>(true);
  const [annotations, setAnnotations] = useState<boolean>(true);
  const [stepID, setStepID] = useState<boolean>(true);
  const [stepLabel, setStepLabel] = useState<boolean>(true);

  const menuItems: Array<TMenuItem> = [
    {label: 'Tooltips', onClick: () => setTooltips(!tooltips), state: tooltips},
    {label: 'Ticks', onClick: () => setTicks(!ticks), state: ticks, divider: true},
    {label: 'Annotations', onClick: () => setAnnotations(!annotations), state: annotations},
    {label: 'Step ID', onClick: () => setStepID(!stepID), state: stepID},
    {label: 'Step label', onClick: () => setStepLabel(!stepLabel), state: stepLabel},
  ];

  const settings: GraphSettings = {
    area: {ticks},
    dots: {
      annotations,
      tooltips,
      id: stepID,
      label: stepLabel,
    },
  };

  return {menuItems, settings};
};

export const useGraphSelectableNodes = (graphId: string, isZijd?: boolean) => {
  const { reference } = useAppSelector(state => state.pcaPageReducer); 
  const [selectableNodes, setSelectableNodes] = useState<Array<ChildNode>>([]);

  const graphElement = document.getElementById(`${graphId}-graph`);

  const elements = {
    containerH: document.getElementById(`${graphId}-h-dots`),
    containerV: document.getElementById(`${graphId}-v-dots`),
    containerAll: document.getElementById(`${graphId}-all-dots`),
  };

  useEffect(() => {
    const nodes: Array<ChildNode> = [];
    if (isZijd) {
      if (elements.containerH && elements.containerV) {
        nodes.push(...elements.containerH.childNodes, ...elements.containerV.childNodes);
      };
    } else {
      if (elements.containerAll) {
        nodes.push(...elements.containerAll.childNodes);
      };
    };
    setSelectableNodes(nodes);
  }, [graphElement, isZijd, reference]);

  return selectableNodes;
};