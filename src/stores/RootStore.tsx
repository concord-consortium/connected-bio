import { types, clone } from 'mobx-state-tree';
import { isEqual } from 'lodash';
import { Organism, OrganelleRef, IOrganelleRef, BeachMouse, FieldMouse } from '../models/Organism';
import { SubstanceType } from '../models/Substance';
import { AppStore, appStore, View } from './AppStore';
import { AssayStore, assayStore } from './AssayStore';
import { stringToEnum, Timer } from '../utils';
import { v4 as uuid } from 'uuid';

export enum Mode {
  Normal = 'NORMAL',
  Assay = 'ASSAY',
  Add = 'ADD',
  Subtract = 'SUBTRACT'
}

let organismsHistory: any[] = [];
let timers: any = {};

const RootStore = types
  .model('RootStore', {
    mode: types.enumeration('Mode', Object.keys(Mode).map(key => Mode[key])),
    organisms: types.map(Organism),
    activeAssay: types.maybe(OrganelleRef),
    lockedAssays: types.optional(types.array(OrganelleRef), []),
    activeSubstance: types.enumeration('SubstanceType', Object.keys(SubstanceType).map(key => SubstanceType[key])),
    activeSubstanceAmount: types.optional(types.number, 0),
    time: types.optional(types.number, 0),
    appStore: AppStore,
    assayStore: AssayStore
  })
  .actions(self => ({
    setMode(newMode: string) {
      self.mode = newMode;

      self.appStore.boxes.forEach(box => {
        if (box.model) {
          if (newMode === Mode.Normal) {
            box.model.run();
            Object.keys(timers).map(key => timers[key]).forEach(timer => timer.resume());
          } else {
            box.model.stop();
            Object.keys(timers).map(key => timers[key]).forEach(timer => timer.pause());
          }
        }
      });
    },

    setLockedAssays(assayOrganelles: any) {
      self.lockedAssays = assayOrganelles;
    },

    setActiveSubstance(substance: SubstanceType) {
      self.activeSubstance = substance;
    },

    setActiveSubstanceAmount(amount: number) {
      self.activeSubstanceAmount = amount;
    },

    startTimer(callback: Function, delay: number, loop: boolean = false) {
      let timerKey = uuid();
      timers[timerKey] =  new Timer(
        () => {
          callback();
          if (!loop) {
            delete timers[timerKey];
          }
        },
        delay,
        loop);
    },

    step(msPassed: number) {
      organismsHistory.push(clone(self.organisms));
      if (organismsHistory.length > 20) {
        organismsHistory.splice(0, 1);
      }

      self.organisms.keys().forEach(orgKey => {
        self.organisms.get(orgKey).step(self.time, organismsHistory);
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
      self.organisms.get(organelleRef.organism.id).incrementOrganelleSubstance(
        organelleRef.organelleType,
        stringToEnum(self.activeSubstance, SubstanceType),
        self.activeSubstanceAmount,
        self.time);
      self.setMode(Mode.Normal);
    },

    /**
     * Finds out what organisms the user is currently viewing the cells of, and removes
     * any assays that shouldn't be visible.
     */
    checkAssays() {
      const assayableOrgs: any[] = appStore.getAllViews().filter(box => {
        return box.view === View.Cell || box.view === View.Protein;
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
  activeSubstance: SubstanceType.Pheomelanin,
  appStore,
  assayStore
});