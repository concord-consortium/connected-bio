import { types } from 'mobx-state-tree';
import { OrganelleType } from '../Types';
import { Substance } from './Substance';
import { SubstanceType } from '../Types';

export const Organelle = types
  .model('Organelle', {
    type: types.enumeration('OrganelleType', Object.keys(OrganelleType).map(key => OrganelleType[key])),
    substanceLevels: types.optional(types.map(Substance), {}),
    substanceDeltas: types.optional(types.map(Substance), {})
  })
  .views(self => ({
    getLevelForSubstance(substanceType: SubstanceType) {
      return self.substanceLevels.get(substanceType) ? self.substanceLevels.get(substanceType).amount : 0;
    },
    getDeltaForSubstance(substanceType: SubstanceType) {
      return self.substanceDeltas.get(substanceType) ? self.substanceDeltas.get(substanceType).amount : 0;
    }
  }))
  .actions(self => ({
    incrementSubstance(substanceType: SubstanceType, amount: number) {
      let substanceLevel = self.substanceDeltas.get(substanceType);
      if (substanceLevel) {
        substanceLevel.increment(amount);
      } else {
        self.substanceDeltas.set(substanceType, Substance.create({
          type: substanceType,
          amount: amount
        }));
      }
    }
  }));