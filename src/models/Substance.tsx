import { types } from 'mobx-state-tree';
import { stringToEnum } from '../utils';
import { IOrganism } from './Organism';
import { OrganelleType, IOrganelle } from './Organelle';

export enum SubstanceType {
  Hormone = 'Hormone',
  GProtein = 'G-Protein',
  Eumelanin = 'Eumelanin'
}

export const Substance: any = types
  .model('Substance', {
    type: types.enumeration('SubstanceType', Object.keys(SubstanceType).map(key => SubstanceType[key])),
    amount: types.optional(types.number, 0)
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
    }
  }))
  .actions(self => ({
    // Cell models can be viewed here: 
    // https://docs.google.com/spreadsheets/d/19f0nk-F3UQ_-A-agq5JnuhJXGCtFYMT_JcYCQkyqnQI/edit
    step(milliseconds: number, parentOrganism: IOrganism, parentOrganelle: IOrganelle) {
      let birthRate, deathRate;
      let hormoneAmount = parentOrganism.getTotalForOrganelleSubstance(
        OrganelleType.Intercell, SubstanceType.Hormone);
      let gProteinAmount = parentOrganism.getTotalForOrganelleSubstance(
        OrganelleType.Cytoplasm, SubstanceType.GProtein);
      let eumelaninAmount = parentOrganism.getTotalForOrganelleSubstance(
        OrganelleType.Melanosome, SubstanceType.Eumelanin);

      switch (self.type) {
        case SubstanceType.Hormone:
          birthRate = parentOrganelle.type === OrganelleType.Intercell 
            ? (300 - .5 * hormoneAmount) / 20
            : 0;
          deathRate = (100 + .2 * hormoneAmount) / 20;
          break;
        case SubstanceType.GProtein:
          birthRate = parentOrganelle.type === OrganelleType.Cytoplasm
            ? parentOrganism.id === 'Forest Mouse'
              ? (150 - .1 * gProteinAmount + .8 * hormoneAmount) / 10
              : (25 - .1 * gProteinAmount) / 10
            : 0;
          deathRate = (25 + .5 * gProteinAmount) / 10;
          break;
        case SubstanceType.Eumelanin:
          birthRate = parentOrganelle.type === OrganelleType.Melanosome
            ? parentOrganism.id === 'Forest Mouse'
              ? (50 - .1 * eumelaninAmount + .5 * gProteinAmount) / 10
              : (25 - .1 * eumelaninAmount + .5 * gProteinAmount) / 10
            : 0;
          deathRate = (25 + .5 * eumelaninAmount) / 10;
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