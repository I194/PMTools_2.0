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