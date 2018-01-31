import { Substance, CellPart } from '../Types';
import { cloneDeep } from 'lodash';

/**
 * An immutable model of an Organism.
 */
export default abstract class Organism {
  private name: string;
  private substanceLevels: { [cellPart in CellPart]: { [substance in Substance]: number} };
  private substanceDeltas: { [cellPart in CellPart]: { [substance in Substance]: number} };
  abstract getImageSrc(): string;
  constructor(name: string, substanceLevels: { [cellPart in CellPart]: { [substance in Substance]: number} }) {
    this.name = name;
    this.substanceLevels = substanceLevels;
    this.substanceDeltas = this.getClearedSubstanceDeltas();
  }

  getName(): string { return this.name; }
  getSubstanceLevels(): { [cellPart in CellPart]: { [substance in Substance]: number} } { 
    return cloneDeep(this.substanceLevels); 
  }
  getSubstanceDeltas(): { [cellPart in CellPart]: { [substance in Substance]: number} } {
    return cloneDeep(this.substanceDeltas); 
  }

  getClearedSubstanceDeltas(): any {
    let deltas = {};
    Object.keys(CellPart).forEach((cellPartKey) => {
      deltas[CellPart[cellPartKey]] = {};
      Object.keys(Substance).forEach((substanceKey) => {
        deltas[CellPart[cellPartKey]][Substance[substanceKey]] = 0;
      });
    });
    return deltas;
  }

  incrementSubstanceLevel(cellPart: CellPart, substance: Substance, amount: number): Organism {
    let organismCopy = cloneDeep(this);
    organismCopy.substanceDeltas[cellPart][substance] += amount;
    return organismCopy;
  }
}

export interface OrganelleInfo {
  organism: Organism;
  cellPart: CellPart;
}
