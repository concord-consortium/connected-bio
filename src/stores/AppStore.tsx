import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organism, IOrganism, FieldMouse } from '../models/Organism';
import { stringToEnum } from '../utils';

export enum View {
  None = 'NONE',
  Organism = 'ORGANISM',
  Cell = 'CELL'
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
    boxes: types.map(Box)
  })
  .views(self => ({
    getBoxOrgName(boxId: string): string {
      return self.boxes.get(boxId).organism.id;
    },

    getBoxView(boxId: string): View {
      return self.boxes.get(boxId).viewType;
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
  }
});