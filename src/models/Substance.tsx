import { types } from 'mobx-state-tree';
import { SubstanceType } from '../Types';

const HALF_LIFE_MS: number = 1000;

export const Substance = types
  .model('Substance', {
    type: types.enumeration('SubstanceType', Object.keys(SubstanceType).map(key => SubstanceType[key])),
    amount: types.number
  })
  .views(self => ({
    get substanceType(): SubstanceType {
      return SubstanceType[Object.keys(SubstanceType).filter((key) => SubstanceType[key] === self.type)[0]];
    }
  }))
  .actions(self => ({
    step(milliseconds: number) {
      let newAmount: number = self.amount * Math.pow(.5, (milliseconds / HALF_LIFE_MS));
      if (Math.abs(newAmount) < .5) {
        newAmount = 0;
      }
      self.amount = newAmount;
    },

    increment(amount: number) {
      self.amount += amount;
    }
  }));