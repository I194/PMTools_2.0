export type Reference = 'specimen' | 'geographic' | 'stratigraphic';

export type Projection = {y: 'W, UP', x: 'N, N'} | {y: 'N, UP', x: 'E, E'} | {y: 'N, N', x: 'E, UP'};

export type StatisticsModePCA = 'pca' | 'pca0' | 'gc' | 'gcn' | null;

export type StatisticsModeDIR = 'fisher' | 'mcFadden' | 'gc' | 'gcn' | null;

export type PCALines = {
  horX: [number, number], horY: [number, number],
  verX: [number, number], verY: [number, number]
} | null;

export type PlaneData = {
  xyData: Array<[number, number]>;
  xyDataSplitted: {neg: Array<[number, number]>, pos: Array<[number, number]>};
  color: string;
};
 
export type MeanDirection = {
  dirData: [number, number];
  xyData: [number, number];
  confidenceCircle?: PlaneData;
  greatCircle?: PlaneData;
  tooltip: TooltipDot;
} | null;

export type TooltipDot = {
  posX?: number;
  posY?: number;
  title?: string;
  label?: string;
  step?: string;
  id?: number;
  x?: number;
  y?: number;
  z?: number;
  dec?: number;
  inc?: number;
  mag?: string;
  meanType?: StatisticsModePCA | StatisticsModeDIR;
  mad?: number;
  a95?: number;
  k?: number;
  comment?: string;
};

export type DotType = 'h' | 'v'| 'all' | 'mean' | string;

export type TMenuItem = {
  label: string;
  state: boolean;
  onClick?: () => void;
  divider?: boolean;
};

export type DotSettings = {
  annotations: boolean;
  tooltips: boolean;
  id?: boolean;
  label?: boolean;
};

export type GraphAreaSettings = {
  ticks: boolean;
};

export type GraphSettings = {
  area: GraphAreaSettings;
  dots: DotSettings;
};

export type Pan = {
  left: number;
  top: number;
};

export type DotsData = Array<{id: number, xyData: [number, number]}>;