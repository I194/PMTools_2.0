export const bgColorMain = (themeMode: 'dark' | 'light') => themeMode === 'dark' 
  ? '#000' 
  : '#e8eaf6';
export const bgColorBlocks = (themeMode: 'dark' | 'light') => themeMode === 'dark' 
  ? '#212121' 
  : '#fff';
export const separatorColor = (themeMode: 'dark' | 'light') => themeMode === 'dark' 
  ? '#e2e2e2' 
  : '#666666';
export const borderColor = (themeMode: 'dark' | 'light') => themeMode === 'dark' 
  ? 'rgba(81, 81, 81, 1)' 
  : '#abb6bc';
export const boxShadowStyle = (themeMode: 'dark' | 'light') => themeMode ==='dark' 
  ? '0px 0px 10px 1px rgba(144, 202, 249, 0.21)' 
  : '0px 0px 10px 1px rgba(34, 60, 80, 0.21)';
export const textColor = (themeMode: 'dark' | 'light') => themeMode ==='dark' 
  ? '#fff'
  : '#000'