import { types, clone } from 'mobx-state-tree';
import { isEqual } from 'lodash';
import { Organism, OrganelleRef, IOrganelleRef, BeachMouse, FieldMouse } from '../models/Organism';
import { Substance, ISubstance, SubstanceType } from '../models/Substance';
import { AppStore, appStore, View } from './AppStore';
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
    activeSubstance: types.enumeration('SubstanceType', Object.keys(SubstanceType).map(key => SubstanceType[key])),
    activeSubstanceAmount: types.optional(types.number, 0),
    activeSubstanceManipulation: types.maybe(Substance),
    time: types.optional(types.number, 0),
    appStore: AppStore,
    assayStore: AssayStore
  })
  .actions(self => ({
    setMode(newMode: string) {
      self.mode = newMode;
    },

    setLockedAssays(assayOrganelles: any) {
      self.lockedAssays = assayOrganelles;
    },

    setActiveSubstance(substance: SubstanceType) {
      self.activeSubstance = substance;
      if (self.activeSubstanceAmount) {
        self.activeSubstanceManipulation = Substance.create({
          type: substance,
          amount: self.activeSubstanceAmount
        });
      }
    },

    setActiveSubstanceAmount(amount: number) {
      self.activeSubstanceAmount = amount;
      if (self.activeSubstance) {
        self.activeSubstanceManipulation = Substance.create({
          type: self.activeSubstance,
          amount: amount
        });
      }
    },

    step(msPassed: number) {
      self.organisms.keys().forEach(orgKey => {
        self.organisms.get(orgKey).step(msPassed);
      });

      self.time += msPassed;
    }
  }))
  .actions(self => ({
    setActiveAssay(assayOrganelle: IOrganelleRef) {
      self.activeAssay = assayOrganelle;

      // add to locked assays immediately
      let repeatAssay = self.lockedAssays.some((assay: IOrganelleRef) => {
        return isEqual(assay, self.activeAssay);
      });
      if (!repeatAssay) {
        self.setLockedAssays(self.lockedAssays.concat([clone(self.activeAssay)]));
      }

      // switch back to normal mode
      self.setMode(Mode.Normal);
    },

    clearAssays() {
      self.activeAssay = null;
      self.setLockedAssays([]);
    },

    toggleSubstanceManipulator(manipulationMode: Mode, amount: number) {
      if (self.mode === Mode.Normal) {
        self.setMode(manipulationMode);
        self.setActiveSubstanceAmount(amount);
      } else {
        self.setMode(Mode.Normal);
      }
    },

    changeSubstanceLevel(organelleRef: IOrganelleRef) {
      let {substanceType, amount} = self.activeSubstanceManipulation as ISubstance;
      self.organisms.get(organelleRef.organism.id).incrementOrganelleSubstance(
        organelleRef.organelleType, substanceType, amount);
      self.setMode(Mode.Normal);
    },

    /**
     * Finds out what organisms the user is currently viewing the cells of, and removes
     * any assays that shouldn't be visible.
     */
    checkAssays() {
      const assayableOrgs: any[] = appStore.getAllViews().filter(box => {
        return box.view === View.Cell || box.view === View.Receptor;
      }).map((box) => box.organism);
      const filteredAssays = self.lockedAssays.filter(assay => assayableOrgs.indexOf(assay.organism) > -1);
      self.setLockedAssays(filteredAssays);
      self.activeAssay = null;
    }
  }));

export const rootStore = RootStore.create({
  mode: Mode.Normal,
  organisms: {
    'Beach Mouse': BeachMouse,
    'Field Mouse': FieldMouse
  },
  activeSubstance: SubstanceType.Hormone,
  appStore,
  assayStore
});