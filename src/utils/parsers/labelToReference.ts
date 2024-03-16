import { Reference } from '../graphs/types';

const labelToReference = (label: string) => {
  if (label === 'Образец') return 'specimen';
  if (label === 'Стратиграфическая') return 'stratigraphic';
  return 'geographic';
};

const referenceToLabel = (reference: Reference) => {
  if (reference === 'specimen') return 'Core';
  if (reference === 'stratigraphic') return 'Strat';
  return 'Geo';
};

export {
  labelToReference,
  referenceToLabel,
};