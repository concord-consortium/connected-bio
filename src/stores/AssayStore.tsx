import { types } from 'mobx-state-tree';
import { SubstanceType } from '../models/Substance';

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
      return GraphType[Object.keys(GraphType).filter((key) => GraphType[key] === self.graph)[0]]; 
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
    [SubstanceType.Substance1]: false,
    [SubstanceType.Substance2]: true,
    [SubstanceType.Substance3]: true
  },
  graph: GraphType.Bar
});