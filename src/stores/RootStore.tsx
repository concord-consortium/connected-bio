import { types } from 'mobx-state-tree';
import { Organism, OrganelleRef, IOrganelleRef, BeachMouse, FieldMouse } from '../models/Organism';
import { Substance, ISubstance, SubstanceType } from '../models/Substance';
import { AppStore, appStore } from './AppStore';
import { AssayStore, assayStore } from './AssayStore';

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
    appStore: AppStore,
    assayStore: AssayStore
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
        self.organisms.get(orgKey).step(msPassed);
      });

      self.time += msPassed;
    },

    changeSubstanceLevel(organelleRef: IOrganelleRef) {
      let {substanceType, amount} = self.activeSubstanceManipulation as ISubstance;
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
    'Beach Mouse': BeachMouse,
    'Field Mouse': FieldMouse
  },
  appStore,
  assayStore
});