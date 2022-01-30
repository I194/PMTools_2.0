export const examplePMD = {
  metadata: {
    name: 'string',
    a: 0,
    b: 0,
    s: 0,
    d: 0,
    v: 0,
  },
  steps: [{
    step: 'string',
    x: 0,
    y: 0,
    z: 0,
    mag: 0,
    Dgeo: 0,
    Igeo: 0,
    Dstrat: 0,
    Istrat: 0,
    a95: 0,
    comment: 'string',
    demagType: 'string',
  }],
  format: 'string',
  created: 'string',
}

export const exampleDir = {
  name: 'string',
  interpretations: [{
    id: 'string',
    code: 'string',
    stepRange: 'string',
    stepCount: 0,
    Dgeo: 0,
    Igeo: 0,
    Dstrat: 0,
    Istrat: 0,
    mad: 0,
    k: 0,
    comment: 'string',
    demagType: 'string',
  }],
  format: 'string',
  created: 'string',
}

export const dataModel_step: any = {
  step: 4,
  x: 10,
  y: 10,
  z: 10,
  mag: 10,
  Dgeo: 6,
  Igeo: 6,
  Dstrat: 6,
  Istrat: 6,
  a95: 5,
  comment: 0
}

export const dataModel_metaPMD: any = {
  name: 10,
  aName: 2,
  a: 5,
  bName: 5,
  b: 5,
  sName: 5,
  s: 5,
  dName: 5,
  d: 5,
  vName: 5,
  v: 7
}

// count of symbols for each property (column) in line (row)
export const dataModel_interpretation: any = {
  id: 7,
  code: 8,
  stepRange: 9,
  stepCount: 3,
  Dgeo: 6,
  Igeo: 6,
  Dstrat: 6,
  Istrat: 6,
  mad: 6,
  k: 5,
  comment: 0
}
