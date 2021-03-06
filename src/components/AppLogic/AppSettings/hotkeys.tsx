import { HotkeysType } from "../../../utils/GlobalTypes";

export const defaultHotkeys: HotkeysType = [
  {
    id: 1,
    title: 'Статистические методы',
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
    title: 'Видимость точек',
    hotkeys: [
      {
        id: 1,
        label: 'Скрыть точки',
        hotkey: {
          key: 'H',
          code: 'KeyH',
        }
      },
      {
        id: 2,
        label: 'Показать точки',
        hotkey: {
          key: 'S',
          code: 'KeyS',
        }
      }
    ]
  },
  {
    id: 3,
    title: 'Обращение полярности направлений',
    hotkeys: [
      {
        id: 1,
        label: 'Обратная полярность',
        hotkey: {
          key: 'R',
          code: 'KeyR',
        }
      },
      {
        id: 2,
        label: 'Прямая полярность',
        hotkey: {
          key: 'T',
          code: 'KeyT',
        }
      }
    ]
  },
  {
    id: 4,
    title: 'Выделение точек',
    hotkeys: [
      {
        id: 1,
        label: 'Убрать выделение',
        hotkey: {
          key: 'U',
          code: 'KeyU',
        }
      },
    ]
  },
  {
    id: 4,
    title: 'Масштабирование графиков',
    hotkeys: [
      {
        id: 1,
        label: 'Изменение масштаба',
        disabled: true,
        hotkey: {
          key: 'MouseWheel',
          code: 'MouseWheel',
        }
      },
      {
        id: 2,
        label: 'Перемещение области видимости',
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
    title: 'Управление диграммой Зийдервельда',
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
        label: 'Переместиться вправо',
        disabled: true,
        hotkey: {
          key: 'Alt + ArrowRight',
          code: 'ArrowRight',
        }
      },
      {
        id: 3,
        label: 'Переместиться влево',
        disabled: true,
        hotkey: {
          key: 'Alt + ArrowLeft',
          code: 'ArrowLeft',
        }
      },
      {
        id: 4,
        label: 'Переместиться вверх',
        disabled: true,
        hotkey: {
          key: 'Alt + ArrowUp',
          code: 'ArrowUp',
        }
      },
      {
        id: 5,
        label: 'Переместиться вниз',
        disabled: true,
        hotkey: {
          key: 'Alt + ArrowDown',
          code: 'ArrowDown',
        }
      },
    ]
  }
];

const loadHotkeys = () => {
  const hotkeys: HotkeysType = JSON.parse(localStorage.getItem('hotkeys')!);

  if (!hotkeys || !hotkeys.length) {
    // Дублирование функционала, актуальная операция в редьюсере
    // localStorage.setItem('hotkeys', JSON.stringify(defaultHotkeys));
    return defaultHotkeys;
  }

  return hotkeys;
};

export default loadHotkeys;