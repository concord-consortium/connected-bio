import { types } from 'mobx-state-tree';
import { IOrganism } from './Organism';
import { Substance, ISubstance, SubstanceType } from './Substance';

export enum OrganelleType {
  Nucleus = 'NUCLEUS',
  Cytoplasm = 'CYTOPLASM',
  Golgi = 'GOLGI',
  Gates = 'GATES',
  Intercell = 'INTERCELL',
  Melanosome = 'MELANOSOME'
}

export const Organelle: any = types
  .model('Organelle', {
    type: types.enumeration('OrganelleType', Object.keys(OrganelleType).map(key => OrganelleType[key])),
    substanceLevels: types.optional(types.map(Substance), {}),
    substanceDeltas: types.optional(types.map(Substance), {})
  })
  .views(self => ({
    getLevelForSubstance(substanceType: SubstanceType) {
      let substanceLevel: ISubstance = self.substanceLevels.get(substanceType);
      return substanceLevel ? substanceLevel.amount : 0;
    },
    getDeltaForSubstance(substanceType: SubstanceType) {
      let substanceDelta: ISubstance = self.substanceDeltas.get(substanceType);
      return substanceDelta ? substanceDelta.amount : 0;
    }
  }))
  .views(self => ({
    getTotalForSubstance(substanceType: SubstanceType) {
      return self.getLevelForSubstance(substanceType) + self.getDeltaForSubstance(substanceType);
    }
  }))
  .actions(self => ({
    incrementSubstance(substanceType: SubstanceType, amount: number) {
      let substanceLevel: ISubstance = self.substanceDeltas.get(substanceType);
      if (substanceLevel) {
        substanceLevel.increment(amount, self);
      } else {
        self.substanceDeltas.set(substanceType, Substance.create({
          type: substanceType,
          amount: amount
        }));
      }
    },
    step(msPassed: number, parentOrganism: IOrganism) {
      Object.keys(SubstanceType).map(key => SubstanceType[key]).forEach(substanceType => {
        let substance = self.substanceDeltas.get(substanceType) as ISubstance;
        if (!substance) {
          substance = Substance.create({type: substanceType});
          self.substanceDeltas.set(substanceType, substance);
        }
        substance.step(msPassed, parentOrganism, self);
      });
    }
  }));
export type IOrganelle = typeof Organelle.Type;