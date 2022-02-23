import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useAppSelector } from '../services/store/hooks';
import { GraphSettings, TMenuItem } from './graphs/types';

export const useWindowSize = () => {
  // отслеживает изменения в размере окна (в том числе при его масштабировании, например, посредством ctrl+, ctrl-)
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
  // производит всю работу с хранением и отображением настроек графиков на странице PCA (PMD Graphs)
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
  // возвращает все точки на графике как NodeList преобразованный в массив Array<ChildNode>
  // необходимо для реализации react-drag-to-select
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
        console.log('->>', nodes)
      };
    };
    setSelectableNodes(nodes);
  }, [graphElement, isZijd, reference]);

  return selectableNodes;
};

export const useGraphSelectedIndexes = () => {
  // возвращает список индексов выбранных точек на графике (каждый индекс равен id - 1)
  // необходимо для синхронизации выбора точек на всей странице:
  // все графики, использующие этот хук, могут быть синхронизованы с другими элементами, 
  // позволяющими выбирать точки - например, с таблицей точек (шагов)
  const { selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer);
  const [selectedIndexes, setSelectedIndexes] = useState<Array<number>>([]);

  // проверка на наличие в сторе выбранных шагов (их ID хранятся в selectedStepsIDs)
  useEffect(() => {
    if (selectedStepsIDs) setSelectedIndexes(selectedStepsIDs.map(id => id - 1));
    else setSelectedIndexes([]); 
  }, [selectedStepsIDs]);

  return selectedIndexes;
}