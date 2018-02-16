import { types } from 'mobx-state-tree';
import { Organism, OrganelleRef, IOrganelleRef, FieldMouse, ForestMouse } from '../models/Organism';
import { Substance, SubstanceType } from '../models/Substance';
import { AppStore, appStore } from './AppStore';

export enum Mode {
  Normal = 'NORMAL',
  Assay = 'ASSAY',
  Add = 'ADD',
  Subtract = 'SUBTRACT'
}

const RootStore = types
  .model('RootStore', {
    mode: types.enumeration('Mode', Object.keys(Mode).map(key => Mode[key])),
    organisms: types.map(Organism),
    activeAssay: types.maybe(OrganelleRef),
    lockedAssays: types.optional(types.array(OrganelleRef), []),
    activeSubstanceManipulation: types.maybe(Substance),
    time: types.optional(types.number, 0),
    appStore: AppStore
  })
  .actions(self => ({
    setMode(newMode: string) {
      self.mode = newMode;
    },

    setActiveAssay(assayOrganelle: IOrganelleRef) {
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
    },

    changeSubstanceLevel(organelleRef: IOrganelleRef) {
      let {substanceType, amount} = self.activeSubstanceManipulation;
      self.organisms.get(organelleRef.organism.id).incrementOrganelleSubstance(
        organelleRef.organelleType, substanceType, amount);
      }
  }))
  .actions(self => ({
    toggleSubstanceManipulator(manipulationMode: Mode, substance: SubstanceType, amount: number) {
      if (self.mode === Mode.Normal) {
        self.setMode(manipulationMode);
        self.setActiveSubstanceManipulation(substance, amount);
      } else {
        self.setMode(Mode.Normal);
      }
    }
  }));

export const rootStore = RootStore.create({
  mode: Mode.Normal,
  organisms: {
    'Field Mouse': FieldMouse,
    'Forest Mouse': ForestMouse
  },
  appStore: appStore
});