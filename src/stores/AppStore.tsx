import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organism, IOrganism, FieldMouse, BeachMouse } from '../models/Organism';
import { stringToEnum, getUrlParamValue } from '../utils';

export enum View {
  None = 'None',
  Organism = 'Organism',
  Cell = 'Cell',
  Protein = 'Protein',
  Genome = 'Genome'
}

const Box = types
  .model('Box', {
    id: types.optional(types.identifier(types.string), () => uuid()),
    organism: types.reference(Organism),
    view: types.enumeration('View', Object.keys(View).map(key => View[key]))
  })
  .volatile(self => ({
    model: null
  }))
  .views(self => ({
    get viewType(): View {
      return stringToEnum(self.view, View);
    }
  }))
  .actions(self => ({
    setModel(model: any) {
      self.model = model;
    }
  }));

export const AppStore = types
  .model('AppStore', {
    boxes: types.map(Box),
    // whether we show graphs and add/remove buttons. In future we should explicitly say what views we want.
    // Default: true, set with `?showSubstances=false`
    showSubstances: types.boolean,
    canEditGenome: types.boolean,
    // which views we allow in the organism boxes
    // Default: ['None', 'Organism', 'Cell', 'Protein'], set with `?availableViews=Organism,Cell`
    _availableViews: types.array(types.string),
  })
  .views(self => ({
    get availableViews() {
      return self._availableViews.map(id => stringToEnum(id, View));
    },

    getBoxOrganism(boxId: string): IOrganism {
      return self.boxes.get(boxId).organism;
    },

    getBoxView(boxId: string): View {
      return self.boxes.get(boxId).viewType;
    },

    getAllViews() {
      return self.boxes.values();
    }
  }))
  .actions(self => ({
    setBoxOrg(boxId: string, org: IOrganism) {
      self.boxes.get(boxId).organism = org;
    },

    setBoxView(boxId: string, view: View) {
      self.boxes.get(boxId).view = view;
    }
  }));

const showSubstances = getUrlParamValue('showSubstances') === 'false' ? false : true;
const availableViews = getUrlParamValue('availableViews') ?
  getUrlParamValue('availableViews').split(',') :
  [View.None, View.Organism, View.Cell, View.Protein];
const initialViews = getUrlParamValue('initialViews') ?
  getUrlParamValue('initialViews').split(',').map((id: string) => stringToEnum(id, View)) :
  [View.Organism, View.Cell];

let initialOrgs = [FieldMouse, FieldMouse];
if (getUrlParamValue('initialOrgs')) {
  initialOrgs = getUrlParamValue('initialOrgs').split(',').map((name: any) =>
    name === 'BeachMouse' ? BeachMouse : FieldMouse);
} else if (getUrlParamValue('initialOrg')) {
  const org = (getUrlParamValue('initialOrg') === 'BeachMouse' ? BeachMouse : FieldMouse);
  initialOrgs = [org, org];
}

const canEditGenome = getUrlParamValue('canEditGenome') === 'true';

export const appStore = AppStore.create({
  boxes: {
    'box-1': {
      id: 'box-1',
      organism: initialOrgs[0],
      view: initialViews[0]
    },
    'box-2': {
      id: 'box-2',
      organism: initialOrgs[1],
      view: initialViews[1]
    }
  },
  showSubstances,
  canEditGenome,
  _availableViews: availableViews
});