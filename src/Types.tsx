export enum Mode {
  Normal = 'NORMAL',
  Assay = 'ASSAY',
  Add = 'ADD',
  Subtract = 'SUBTRACT'
}

export enum CellPart {
  Nucleus = 'NUCLEUS',
  Cytoplasm = 'CYTOPLASM',
  Golgi = 'GOLGI',
  Gates = 'GATES',
  Intercell = 'INTERCELL'
}

export enum Substance {
  Substance1 = 'Substance 1',
  Substance2 = 'Substance 2',
  Substance3 = 'Substance 3'
}

export interface OrganelleInfo {
  cellPart: CellPart;
}