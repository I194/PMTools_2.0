import { IDirData, IPmdData } from "../GlobalTypes"

export const examplePMD: IPmdData = {
  metadata: {
    name: 'string',
    a: 0,
    b: 0,
    s: 0,
    d: 0,
    v: 0,
  },
  steps: [{
    id: 0,
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
    demagType: undefined,
  }],
  format: 'string',
  created: 'string',
}

export const exampleDir: IDirData = {
  name: 'string',
  interpretations: [{
    id: 0,
    label: 'string',
    code: 'string',
    stepRange: 'string',
    stepCount: 0,
    Dgeo: 0,
    Igeo: 0,
    Dstrat: 0,
    Istrat: 0,
    MADgeo: 0,
    Kgeo: 0,
    MADstrat: 0,
    Kstrat: 0,
    comment: 'string',
    demagType: undefined,
  }],
  format: 'string',
  created: 'string',
}

export const exampleSitesLatLon = {
  data: [{lat: 0, lon: 0, age: 0, plateId: 0}],
  format: "CSV_SitesLatLon",
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
export const dataModel_interpretation_from_pca: any = {
  label: 7,
  code: 8,
  stepRange: 9,
  stepCount: 3,
  Dgeo: 6,
  Igeo: 6,
  Dstrat: 6,
  Istrat: 6,
  Kgeo: 7, // must match Kgeo from IDirData["interpretations"]
  MADgeo: 5, // must match MADgeo from IDirData["interpretations"]
  comment: 0
}

export const dataModel_interpretation_from_dir: any = {
  label: 7,
  code: 8,
  stepRange: 9,
  stepCount: 3,
  Dgeo: 6,
  Igeo: 6,
  Kgeo: 7,
  MADgeo: 5,
  Dstrat: 6,
  Istrat: 6,
  Kstrat: 7,
  MADstrat: 5,
  comment: 0
}
