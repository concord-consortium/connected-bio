import { types } from 'mobx-state-tree';
import { SubstanceType } from '../models/Substance';
import { stringToEnum } from '../utils';

export enum GraphType {
  Bar = 'BAR',
  Line = 'LINE'
}

export const AssayStore = types
  .model('AssayStore', {
    visibleSubstances: types.map(types.boolean),
    graph: types.enumeration('GraphType', Object.keys(GraphType).map(key => GraphType[key]))
  })
  .views(self => ({
    get graphType(): GraphType {
      return stringToEnum(self.graph, GraphType);
    }
  }))
  .actions(self => ({
    setSubstanceVisibility(substance: SubstanceType, visible: boolean) {
      self.visibleSubstances.set(substance, visible);
    },

    setGraphType(graphType: GraphType) {
      self.graph = graphType;
    }
  }));

export const assayStore = AssayStore.create({
  visibleSubstances: {
    [SubstanceType.Hormone]: true,
    [SubstanceType.GProtein]: true,
    [SubstanceType.Eumelanin]: true,
    [SubstanceType.Pheomelanin]: true
  },
  graph: GraphType.Bar
});