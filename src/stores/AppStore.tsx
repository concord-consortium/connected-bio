import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organism, IOrganism, FieldMouse } from '../models/Organism';
import { stringToEnum, getUrlParamValue } from '../utils';

export enum View {
  None = 'None',
  Organism = 'Organism',
  Cell = 'Cell',
  Receptor = 'Receptor'
}

const Box = types
  .model('Box', {
    id: types.optional(types.identifier(types.string), () => uuid()),
    organism: types.reference(Organism),
    view: types.enumeration('View', Object.keys(View).map(key => View[key]))
  })
  .views(self => ({
    get viewType(): View {
      return stringToEnum(self.view, View);
    }
  }));

export const AppStore = types
  .model('AppStore', {
    boxes: types.map(Box),
    // whether we show graphs and add/remove buttons. In future we should explicitly say what views we want.
    // Default: true, set with `?showSubstances=false`
    showSubstances: types.boolean,
    // which views we allow in the organism boxes
    // Default: ['None', 'Organism', 'Cell', 'Receptor'], set with `?availableViews=Organism,Cell`
    availableViews: types.array(types.string)
  })
  .views(self => ({
    getAvailableViews() {
      return self.availableViews.map(id => stringToEnum(id, View));
    },

    getBoxOrgName(boxId: string): string {
      return self.boxes.get(boxId).organism.id;
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
  [View.None, View.Organism, View.Cell, View.Receptor];

export const appStore = AppStore.create({
  boxes: {
    'box-1': {
      id: 'box-1',
      organism: FieldMouse,
      view: View.Organism
    },
    'box-2': {
      id: 'box-2',
      organism: FieldMouse,
      view: View.Cell
    }
  },
  showSubstances: showSubstances,
  availableViews: availableViews
});