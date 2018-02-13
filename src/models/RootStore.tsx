import { types } from 'mobx-state-tree';
import { Mode, SubstanceType } from '../Types';
import { Organism, OrganelleInfo, IOrganelleInfo, FieldMouse, ForestMouse } from './Organism';
import { Substance } from './Substance';

const RootStore = types
  .model('RootStore', {
    mode: types.enumeration('Mode', Object.keys(Mode).map(key => Mode[key])),
    organisms: types.map(Organism),
    activeAssay: types.maybe(OrganelleInfo),
    lockedAssays: types.optional(types.array(OrganelleInfo), []),
    activeSubstanceManipulation: types.maybe(Substance),
    time: types.optional(types.number, 0)
  })
  .actions(self => ({
    setMode(newMode: string) {
      self.mode = newMode;
    },

    setActiveAssay(assayOrganelle: IOrganelleInfo) {
      self.activeAssay = assayOrganelle;
    },

    setLockedAssays(assayOrganelles: any) {
      self.lockedAssays = assayOrganelles;
    },
    
    setActiveSubstanceManipulation(substanceType: SubstanceType, amount: number) {
      self.activeSubstanceManipulation = Substance.create({
        type: substanceType,
        amount
      });
    },

    step(msPassed: number) {
      self.organisms.keys().forEach(orgKey => {
        let organism = self.organisms.get(orgKey);
        organism.organelles.keys().forEach(organelleKey => {
          let organelle = organism.organelles.get(organelleKey);
          organelle.substanceDeltas.keys().forEach(substanceKey => {
            organelle.substanceDeltas.get(substanceKey).step(msPassed);
          });
        });
      });

      self.time += msPassed;
    }
  }));

export const rootStore = RootStore.create({
  mode: Mode.Normal,
  organisms: {
    'Field Mouse': FieldMouse,
    'Forest Mouse': ForestMouse
  }
});