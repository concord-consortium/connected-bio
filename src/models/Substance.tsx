import { types } from 'mobx-state-tree';
import { stringToEnum } from '../utils';
import { IOrganism } from './Organism';
import { OrganelleType, IOrganelle } from './Organelle';

export enum SubstanceType {
  Hormone = 'Hormone',
  GProtein = 'G-Protein',
  Eumelanin = 'Eumelanin',
  Pheomelanin = 'Pheomelanin'
}

const substanceManipulationTime = 3500;

export const Substance: any = types
  .model('Substance', {
    type: types.enumeration('SubstanceType', Object.keys(SubstanceType).map(key => SubstanceType[key])),
    amount: types.optional(types.number, 0),
    fixedValueEndTime: types.optional(types.number, 0)
  })
  .views(self => ({
    get substanceType(): SubstanceType {
      return stringToEnum(self.type, SubstanceType);
    }
  }))
  .actions(self => ({
    increment(amount: number, parentOrganelle: IOrganelle) {
      let base = parentOrganelle.getLevelForSubstance(self.type);
      self.amount = Math.max(self.amount + amount, -1 * base);
    },

    setType(substanceType: SubstanceType) {
      self.type = substanceType;
    }
  }))
  .actions(self => ({
    manuallyIncrement(amount: number, parentOrganelle: IOrganelle, currentTime: number) {
      self.increment(amount, parentOrganelle);
      self.fixedValueEndTime = currentTime + substanceManipulationTime;
    },

    // Cell models can be viewed here:
    // https://docs.google.com/spreadsheets/d/19f0nk-F3UQ_-A-agq5JnuhJXGCtFYMT_JcYCQkyqnQI/edit
    step(currentTime: number, parentOrganism: IOrganism, parentOrganelle: IOrganelle) {
      let birthRate, deathRate;
      let hormoneAmount = parentOrganism.getTotalForOrganelleSubstance(
        OrganelleType.Extracellular, SubstanceType.Hormone);
      let gProteinAmount = parentOrganism.getTotalForOrganelleSubstance(
        OrganelleType.Cytoplasm, SubstanceType.GProtein);
      let eumelaninAmount = parentOrganism.getTotalForOrganelleSubstance(
        OrganelleType.Melanosome, SubstanceType.Eumelanin);
      let pheomelaninAmount = parentOrganism.getTotalForOrganelleSubstance(
        OrganelleType.Melanosome, SubstanceType.Pheomelanin);

      if (self.fixedValueEndTime > currentTime) {
        // User has recently set value, and we want to stay at this value
        return;
      }

      switch (self.type) {
        case SubstanceType.Hormone:
          birthRate = parentOrganelle.type === OrganelleType.Extracellular
            ? 300 / 20
            : 0;
          deathRate = (100 + 1.6 * hormoneAmount) / 20;
          break;
        case SubstanceType.GProtein:
          birthRate = parentOrganelle.type === OrganelleType.Cytoplasm
            ? parentOrganism.id === 'Field Mouse'
              ? (180 + .8 * hormoneAmount) / 10
              : 25 / 10
            : 0;
          deathRate = (25 + 1.5 * gProteinAmount) / 10;
          break;
        case SubstanceType.Eumelanin:
          birthRate = parentOrganelle.type === OrganelleType.Melanosome
            ? parentOrganism.id === 'Field Mouse'
              ? (280 + 1.5 * gProteinAmount) / 10
              : (25 + 1.8 * gProteinAmount) / 10
            : 0;
          deathRate = (25 + 1.5 * eumelaninAmount) / 10;
          break;
        case SubstanceType.Pheomelanin:
          birthRate = parentOrganelle.type === OrganelleType.Melanosome
            ? (500 - 1.5 * gProteinAmount) / 10
            : 0;
          deathRate = (25 + 1.5 * pheomelaninAmount) / 10;
          break;
        default:
          birthRate = 0;
          deathRate = 0;
          break;
      }
      self.increment(birthRate - deathRate, parentOrganelle);
    }
  }));
export type ISubstance = typeof Substance.Type;