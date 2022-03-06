import { ThemeMode } from "./GlobalTypes";
import { DotType } from "./graphs/types";

export const bgColorMain = (themeMode: ThemeMode) => themeMode === 'dark' 
  ? '#000' 
  : '#e8eaf6';
export const bgColorBlocks = (themeMode: ThemeMode) => themeMode === 'dark' 
  ? '#212121' 
  : '#fff';
export const separatorColor = (themeMode: ThemeMode) => themeMode === 'dark' 
  ? '#e2e2e2' 
  : '#666666';
export const borderColor = (themeMode: ThemeMode) => themeMode === 'dark' 
  ? 'rgba(81, 81, 81, 1)' 
  : '#abb6bc';
export const boxShadowStyle = (themeMode: ThemeMode) => themeMode ==='dark' 
  ? '0px 0px 10px 1px rgba(144, 202, 249, 0.21)' 
  : '0px 0px 10px 1px rgba(34, 60, 80, 0.21)';
export const textColor = (themeMode: ThemeMode) => themeMode ==='dark' 
  ? '#fff'
  : '#000';
export const textColorInverted = (themeMode: ThemeMode) => themeMode ==='dark' 
  ? '#000'
  : '#fff';
export const primaryColor = (themeMode: ThemeMode) => themeMode ==='dark' 
  ? '#90CAF9'
  : '#1976d2';
export const successColor = (themeMode: ThemeMode) => themeMode === 'dark'
  ? '#388e3c'
  : '#4caf50';
export const errorColor = (themeMode: ThemeMode) => themeMode === 'dark'
  ? '#f44336'
  : '#d32f2f';

export const graphSelectedDotColor = (dotType: DotType) => {
  if (dotType === 'all') return '#1125ff';
  if (dotType === 'h') return '#7411ff';
  if (dotType === 'v') return '#119dff';
  if (dotType === 'mean') return '#ff119c';
  return 'transparent';
};