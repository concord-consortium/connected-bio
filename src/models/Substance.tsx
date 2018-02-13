import { types } from 'mobx-state-tree';

const HALF_LIFE_MS: number = 1000;

export enum SubstanceType {
  Substance1 = 'Substance 1',
  Substance2 = 'Substance 2',
  Substance3 = 'Substance 3'
}

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