export type Reference = 'specimen' | 'geographic' | 'stratigraphic';

export type TooltipDot = {
  posX?: number;
  posY?: number;
  title?: string;
  step?: string;
  id?: number;
  x?: number;
  y?: number;
  z?: number;
  dec?: number;
  inc?: number;
  mag?: string;
  a95?: number;
  k?: number;
  comment?: string;
};

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