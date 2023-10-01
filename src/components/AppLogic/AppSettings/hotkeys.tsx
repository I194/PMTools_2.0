import React from "react";
import { useTranslation } from "react-i18next";
import { useDefaultHotkeys } from "../../../utils/GlobalHooks";
import { HotkeysType } from "../../../utils/GlobalTypes";

// export const defaultHotkeys = (): HotkeysType => {
//   const { t, i18n } = useTranslation('translation');
//   return [
//     {
//       id: 1,
//       title: t('settings.hotkeys.statMethods.title'),
//       hotkeys: [
//         {
//           id: 1,
//           label: 'PCA',
//           hotkey: {
//             key: 'D',
//             code: 'KeyD',
//           }
//         },
//         {
//           id: 2,
//           label: 'PCA0',
//           hotkey: {
//             key: 'O',
//             code: 'KeyO',
//           }
//         },
//         {
//           id: 3,
//           label: 'GC',
//           hotkey: {
//             key: 'G',
//             code: 'KeyG',
//           }
//         },
//         {
//           id: 4,
//           label: 'GCN',
//           hotkey: {
//             key: 'I',
//             code: 'KeyI',
//           }
//         },
//         {
//           id: 5,
//           label: 'Fisher',
//           hotkey: {
//             key: 'F',
//             code: 'KeyF',
//           }
//         },
//         {
//           id: 6,
//           label: 'McFadden',
//           hotkey: {
//             key: 'M',
//             code: 'KeyM',
//           }
//         }
//       ]
//     },
//     {
//       id: 2,
//       title: t('settings.hotkeys.visibility.title'),
//       hotkeys: [
//         {
//           id: 1,
//           label: t('settings.hotkeys.visibility.hide'),
//           hotkey: {
//             key: 'H',
//             code: 'KeyH',
//           }
//         },
//         {
//           id: 2,
//           label: t('settings.hotkeys.visibility.show'),
//           hotkey: {
//             key: 'S',
//             code: 'KeyS',
//           }
//         }
//       ]
//     },
//     {
//       id: 3,
//       title: t('settings.hotkeys.reverse.title'),
//       hotkeys: [
//         {
//           id: 1,
//           label: t('settings.hotkeys.reverse.reversed'),
//           hotkey: {
//             key: 'R',
//             code: 'KeyR',
//           }
//         },
//         {
//           id: 2,
//           label: t('settings.hotkeys.reverse.normal'),
//           hotkey: {
//             key: 'T',
//             code: 'KeyT',
//           }
//         }
//       ]
//     },
//     {
//       id: 4,
//       title: t('settings.hotkeys.selection.title'),
//       hotkeys: [
//         {
//           id: 1,
//           label: t('settings.hotkeys.selection.deleteSelection'),
//           hotkey: {
//             key: 'U',
//             code: 'KeyU',
//           }
//         },
//       ]
//     },
//     {
//       id: 4,
//       title: t('settings.hotkeys.zoom.title'),
//       hotkeys: [
//         {
//           id: 1,
//           label: t('settings.hotkeys.zoom.zoomInOut'),
//           disabled: true,
//           hotkey: {
//             key: 'MouseWheel',
//             code: 'MouseWheel',
//           }
//         },
//         {
//           id: 2,
//           label: t('settings.hotkeys.zoom.pan'),
//           disabled: true,
//           hotkey: {
//             key: 'Alt + MouseClick',
//             code: 'Alt + MouseClick',
//           }
//         },
//       ]
//     },
//     {
//       id: 6,
//       title: t('settings.hotkeys.zijd.title'),
//       hotkeys: [
//         // {
//         //   id: 1,
//         //   label: 'Управление масштабом',
//         //   disabled: true,
//         //   hotkey: {
//         //     key: 'MouseWheel',
//         //     code: 'MouseWheel',
//         //   }
//         // },
//         {
//           id: 2,
//           label: t('settings.hotkeys.zijd.right'),
//           disabled: true,
//           hotkey: {
//             key: 'Alt + ArrowRight',
//             code: 'ArrowRight',
//           }
//         },
//         {
//           id: 3,
//           label: t('settings.hotkeys.zijd.left'),
//           disabled: true,
//           hotkey: {
//             key: 'Alt + ArrowLeft',
//             code: 'ArrowLeft',
//           }
//         },
//         {
//           id: 4,
//           label: t('settings.hotkeys.zijd.top'),
//           disabled: true,
//           hotkey: {
//             key: 'Alt + ArrowUp',
//             code: 'ArrowUp',
//           }
//         },
//         {
//           id: 5,
//           label: t('settings.hotkeys.zijd.bottom'),
//           disabled: true,
//           hotkey: {
//             key: 'Alt + ArrowDown',
//             code: 'ArrowDown',
//           }
//         },
//       ]
//     }
//   ];
// }
// const loadHotkeys = () => {
//   const defaultHotkeys = useDefaultHotkeys();
//   const hotkeys: HotkeysType = JSON.parse(localStorage.getItem('hotkeys')!);

//   if (!hotkeys || !hotkeys.length) {
//     // Дублирование функционала, актуальная операция в редьюсере
//     // localStorage.setItem('hotkeys', JSON.stringify(defaultHotkeys));
//     return defaultHotkeys;
//   }

//   return hotkeys;
// };

// export default loadHotkeys;