import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../services/store/hooks';
import { HotkeysType } from './GlobalTypes';
import { GraphSettings, TMenuItem } from './graphs/types';

export const useWindowSize = () => {
  // отслеживает изменения в размере окна (в том числе при его масштабировании, например, посредством ctrl+, ctrl-)
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    }
    // window.onresize = () => updateSize();
    window.addEventListener('resize', updateSize);
    updateSize();
  }, []);
  return size;
};

export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');
  useLayoutEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setSystemTheme('dark');
    } else setSystemTheme('light');
  }, []);
  return systemTheme;
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
    {label: 'Show №', onClick: () => setStepID(!stepID), state: stepID},
    {label: 'Show label', onClick: () => setStepLabel(!stepLabel), state: stepLabel},
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

export const useDIRGraphSettings = () => {
  // производит всю работу с хранением и отображением настроек графиков на странице DIR (DIR Graphs)
  const [tooltips, setTooltips] = useState<boolean>(true);
  const [ticks, setTicks] = useState<boolean>(true);
  const [annotations, setAnnotations] = useState<boolean>(true);
  const [directionID, setDirectionID] = useState<boolean>(true);
  const [directionLabel, setDirectionLabel] = useState<boolean>(true);
  const [confidenceCircle, setConfidenceCircle] = useState<boolean>(false);

  const menuItems: Array<TMenuItem> = [
    {label: 'Tooltips', onClick: () => setTooltips(!tooltips), state: tooltips},
    {label: 'Ticks', onClick: () => setTicks(!ticks), state: ticks, divider: true},
    {label: 'Annotations', onClick: () => setAnnotations(!annotations), state: annotations},
    {label: 'Show №', onClick: () => setDirectionID(!directionID), state: directionID},
    {label: 'Show label', onClick: () => setDirectionLabel(!directionLabel), state: directionLabel, divider: true},
    {label: 'Show confidence circles', onClick: () => setConfidenceCircle(!confidenceCircle), state: confidenceCircle},
  ];

  const settings: GraphSettings = {
    area: {ticks},
    dots: {
      annotations,
      tooltips,
      id: directionID,
      label: directionLabel,
      confidenceCircle
    },
  };

  return {menuItems, settings};
};


export const useGraphSelectableNodesPCA = (graphId: string, isZijd?: boolean) => {
  // возвращает все точки на графике как NodeList преобразованный в массив Array<ChildNode>
  // необходимо для реализации react-drag-to-select
  const { reference, hiddenStepsIDs } = useAppSelector(state => state.pcaPageReducer); 
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
  }, [graphElement, isZijd, reference, hiddenStepsIDs]);

  return selectableNodes;
};


export const useGraphSelectableNodesDIR = (graphId: string) => {
  // возвращает все точки на графике как NodeList преобразованный в массив Array<ChildNode>
  // необходимо для реализации react-drag-to-select
  const { reference, hiddenDirectionsIDs } = useAppSelector(state => state.dirPageReducer); 
  const [selectableNodes, setSelectableNodes] = useState<Array<ChildNode>>([]);

  const graphElement = document.getElementById(`${graphId}-graph`);

  const elements = {
    containerH: document.getElementById(`${graphId}-h-dots`),
    containerV: document.getElementById(`${graphId}-v-dots`),
    containerAll: document.getElementById(`${graphId}-all-dots`),
  };

  useEffect(() => {
    const nodes: Array<ChildNode> = [];
    if (elements.containerAll) {
      nodes.push(...elements.containerAll.childNodes);
    };
    setSelectableNodes(nodes);
  }, [graphElement, reference, hiddenDirectionsIDs]);

  return selectableNodes;
};

export const useGraphSelectedIDs = (page: 'pca' | 'dir' = 'pca') => {
  // возвращает список индексов выбранных точек на графике (каждый индекс равен id - 1)
  // необходимо для синхронизации выбора точек на всей странице:
  // все графики, использующие этот хук, могут быть синхронизованы с другими элементами, 
  // позволяющими выбирать точки - например, с таблицей точек (шагов)
  const { selectedStepsIDs } = useAppSelector(state => state.pcaPageReducer);
  const { selectedDirectionsIDs } = useAppSelector(state => state.dirPageReducer);
  const selectedDataIDs = page === 'pca' ? selectedStepsIDs : selectedDirectionsIDs;
  const [selectedIDs, setSelectedIDs] = useState<Array<number>>([]);

  // проверка на наличие в сторе выбранных шагов (их ID хранятся в selectedStepsIDs)
  useEffect(() => {
    if (selectedDataIDs) setSelectedIDs(selectedDataIDs.map(id => id));
    else setSelectedIDs([]); 
  }, [selectedDataIDs]);

  return selectedIDs;
};

export const useDebounce = (value: any, delay: number) => {
  // The hook will only return the latest value (what we passed in) ...
  // ... if it's been more than 500ms since it was last called.
  // Otherwise, it will return the previous value of searchTerm.
  // The goal (common example) is to only have the API call fire when user stops typing 
  
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set debouncedValue to value (passed in) after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Return a cleanup function that will be called every time useEffect is re-called. 
      return () => {
        clearTimeout(handler);
      };
    },
    // Only re-call effect if value changes
    // You could also add the "delay" var to inputs array if you ...
    // ... need to be able to change that dynamically.
    [value] 
  );

  return debouncedValue;
}

export const useDefaultHotkeys = (): HotkeysType => {
  const { t, i18n } = useTranslation('translation');

  const defaultHotkeys: HotkeysType = [
    {
      id: 1,
      title: t('settings.hotkeys.statMethods.title'),
      hotkeys: [
        {
          id: 1,
          label: 'PCA',
          hotkey: {
            key: 'D',
            code: 'KeyD',
          }
        },
        {
          id: 2,
          label: 'PCA0',
          hotkey: {
            key: 'O',
            code: 'KeyO',
          }
        },
        {
          id: 3,
          label: 'GC',
          hotkey: {
            key: 'G',
            code: 'KeyG',
          }
        },
        {
          id: 4,
          label: 'GCN',
          hotkey: {
            key: 'I',
            code: 'KeyI',
          }
        },
        {
          id: 5,
          label: 'Fisher',
          hotkey: {
            key: 'F',
            code: 'KeyF',
          }
        },
        {
          id: 6,
          label: 'McFadden',
          hotkey: {
            key: 'M',
            code: 'KeyM',
          }
        }
      ]
    },
    {
      id: 2,
      title: t('settings.hotkeys.visibility.title'),
      hotkeys: [
        {
          id: 1,
          label: t('settings.hotkeys.visibility.hide'),
          hotkey: {
            key: 'H',
            code: 'KeyH',
          }
        },
        {
          id: 2,
          label: t('settings.hotkeys.visibility.show'),
          hotkey: {
            key: 'S',
            code: 'KeyS',
          }
        }
      ]
    },
    {
      id: 3,
      title: t('settings.hotkeys.reverse.title'),
      hotkeys: [
        {
          id: 1,
          label: t('settings.hotkeys.reverse.reversed'),
          hotkey: {
            key: 'R',
            code: 'KeyR',
          }
        },
        {
          id: 2,
          label: t('settings.hotkeys.reverse.normal'),
          hotkey: {
            key: 'T',
            code: 'KeyT',
          }
        }
      ]
    },
    {
      id: 4,
      title: t('settings.hotkeys.selection.title'),
      hotkeys: [
        {
          id: 1,
          label: t('settings.hotkeys.selection.deleteSelection'),
          hotkey: {
            key: 'U',
            code: 'KeyU',
          }
        },
      ]
    },
    {
      id: 4,
      title: t('settings.hotkeys.zoom.title'),
      hotkeys: [
        {
          id: 1,
          label: t('settings.hotkeys.zoom.zoomInOut'),
          disabled: true,
          hotkey: {
            key: 'MouseWheel',
            code: 'MouseWheel',
          }
        },
        {
          id: 2,
          label: t('settings.hotkeys.zoom.pan'),
          disabled: true,
          hotkey: {
            key: 'Alt + MouseClick',
            code: 'Alt + MouseClick',
          }
        },
      ]
    },
    {
      id: 6,
      title: t('settings.hotkeys.zijd.title'),
      hotkeys: [
        // {
        //   id: 1,
        //   label: 'Управление масштабом',
        //   disabled: true,
        //   hotkey: {
        //     key: 'MouseWheel',
        //     code: 'MouseWheel',
        //   }
        // },
        {
          id: 2,
          label: t('settings.hotkeys.zijd.right'),
          disabled: true,
          hotkey: {
            key: 'Alt + ArrowRight',
            code: 'ArrowRight',
          }
        },
        {
          id: 3,
          label: t('settings.hotkeys.zijd.left'),
          disabled: true,
          hotkey: {
            key: 'Alt + ArrowLeft',
            code: 'ArrowLeft',
          }
        },
        {
          id: 4,
          label: t('settings.hotkeys.zijd.top'),
          disabled: true,
          hotkey: {
            key: 'Alt + ArrowUp',
            code: 'ArrowUp',
          }
        },
        {
          id: 5,
          label: t('settings.hotkeys.zijd.bottom'),
          disabled: true,
          hotkey: {
            key: 'Alt + ArrowDown',
            code: 'ArrowDown',
          }
        },
        {
          id: 6,
          label: t('settings.hotkeys.zijd.projection.scroll'),
          hotkey: {
            key: 'P',
            code: 'KeyP',
          }
        }
      ]
    },
    {
      id: 7,
      title: t('settings.hotkeys.coordinates.title'),
      hotkeys: [
        {
          id: 1,
          label: t('settings.hotkeys.coordinates.scroll'),
          hotkey: {
            key: 'Q',
            code: 'KeyQ',
          }
        },
      ]
    },
    {
      id: 8,
      title: t('settings.hotkeys.fileSelector.title'),
      hotkeys: [
        {
          id: 1,
          label: t('settings.hotkeys.fileSelector.right'),
          disabled: true,
          hotkey: {
            key: 'Shift + ArrowLeft',
            code: 'Shift + ArrowLeft',
          }
        },
        {
          id: 2,
          label: t('settings.hotkeys.fileSelector.left'),
          disabled: true,
          hotkey: {
            key: 'Shift + ArrowRight',
            code: 'Shift + ArrowRight',
          }
        },
      ]
    },
  ];

  return defaultHotkeys;
}