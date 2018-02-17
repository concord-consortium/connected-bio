import { types } from 'mobx-state-tree';
import { stringToEnum } from '../utils';
import { IOrganelle } from './Organelle';

export enum SubstanceType {
  Substance1 = 'Hormone',
  Substance2 = 'G-Protein',
  Substance3 = 'Eumelanin'
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
    // Cell models can be viewed here: 
    // https://docs.google.com/spreadsheets/d/19f0nk-F3UQ_-A-agq5JnuhJXGCtFYMT_JcYCQkyqnQI/edit?usp=sharing
    step(milliseconds: number, parentOrganelle: IOrganelle) {
      let birthRate, deathRate;
      let hormoneAmount = parentOrganelle.getTotalForSubstance(SubstanceType.Substance1);
      let gProteinAmount = parentOrganelle.getTotalForSubstance(SubstanceType.Substance2);
      let eumelaninAmount = parentOrganelle.getTotalForSubstance(SubstanceType.Substance3);
      console.log(hormoneAmount);

      switch (self.type) {
        case SubstanceType.Substance1:
          birthRate = (300 - .5 * hormoneAmount) / 20;
          deathRate = (100 + .2 * hormoneAmount) / 20;
          break;
        case SubstanceType.Substance2:
          birthRate = (150 - .1 * gProteinAmount + .8 * hormoneAmount) / 10;
          deathRate = (25 + .5 * gProteinAmount) / 10;
          break;
        case SubstanceType.Substance3:
          birthRate = (50 - .1 * eumelaninAmount + .5 * gProteinAmount) / 3;
          deathRate = (25 + .5 * eumelaninAmount) / 3;
          break;
        default:
          birthRate = 0;
          deathRate = 0;
          break;
      }
      self.amount = self.amount + birthRate - deathRate;
    },

    increment(amount: number) {
      self.amount += amount;
    }
  }));
export type ISubstance = typeof Substance.Type;