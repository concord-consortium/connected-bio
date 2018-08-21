import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organism, IOrganism, FieldMouse, BeachMouse, Heterozygote } from '../models/Organism';
import { stringToEnum, getUrlParamValue } from '../utils';

export enum View {
  Population = 'Population',
  Organism = 'Organism',
  Cell = 'Cell',
  Protein = 'Protein',
  Builder = 'Builder'
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
    // whether the locations are substances are shown with true names (melanosome, pheomelanin) or
    // "mystery" names (location 1, substance a)
    // Default: false, set with `?mysteryLabels=true`
    mysteryLabels: types.boolean,
    // which views we allow in the organism boxes
    // Default: ['Population', 'Organism', 'Cell', 'Protein'], set with `?availableViews=Organism,Cell`
    _availableViews: types.array(types.string),
    // which organisms we allow in the organism boxes
    // Default: [BeachMouse, FieldMouse, Heterozygote], set with `?availableOrgs=BeachMouse,FieldMouse`
    _availableOrgs: types.array(types.reference(Organism)),
  })
  .views(self => ({
    get availableViews() {
      return self._availableViews.map(id => stringToEnum(id, View));
    },

    get availableOrgs() {
      return self._availableOrgs;
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

const urlParamToMouse = (param: string) => {
  switch (param) {
    case 'BeachMouse':
      return BeachMouse;
    case 'FieldMouse':
      return FieldMouse;
    default:
      return Heterozygote;
  }
};
const showSubstances = getUrlParamValue('showSubstances') === 'false' ? false : true;
const availableViews = getUrlParamValue('availableViews') ?
  getUrlParamValue('availableViews').split(',') :
  [View.Population, View.Organism, View.Cell, View.Protein, View.Builder];
const availableOrgs = getUrlParamValue('availableOrgs')
  ? getUrlParamValue('availableOrgs').split(',').map((name: any) => urlParamToMouse(name))
  : [BeachMouse, FieldMouse, Heterozygote];
const initialViews = getUrlParamValue('initialViews') ?
  getUrlParamValue('initialViews').split(',').map((id: string) => stringToEnum(id, View)) :
  [View.Organism, View.Cell];

let initialOrgs = [FieldMouse, FieldMouse];
if (getUrlParamValue('initialOrgs')) {
  initialOrgs = getUrlParamValue('initialOrgs').split(',').map((name: any) => urlParamToMouse(name));
} else if (getUrlParamValue('initialOrg')) {
  const org = urlParamToMouse(getUrlParamValue('initialOrg'));
  initialOrgs = [org, org];
}

const mysteryLabels = getUrlParamValue('mysteryLabels') === 'true' ? true : false;

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
  showSubstances: showSubstances,
  mysteryLabels: mysteryLabels,
  _availableViews: availableViews,
  _availableOrgs: availableOrgs
});