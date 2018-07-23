import { types } from 'mobx-state-tree';
import { SubstanceType } from '../models/Substance';
import { stringToEnum, getUrlParamValue } from '../utils';

export enum GraphType {
  Bar = 'BAR',
  Line = 'LINE'
}

export const AssayStore = types
  .model('AssayStore', {
    visibleSubstances: types.map(types.boolean),
    graph: types.enumeration('GraphType', Object.keys(GraphType).map(key => GraphType[key])),
    // Whether we show line graphs
    // Default: false, set with `?showLineGraphs=true`
    showLineGraphs: types.boolean,
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

const showLineGraphs = getUrlParamValue('showLineGraphs') === 'true' ? true : false;

export const assayStore = AssayStore.create({
  visibleSubstances: {
    [SubstanceType.Pheomelanin]: true,
    [SubstanceType.SignalProtein]: true,
    [SubstanceType.Eumelanin]: true,
    [SubstanceType.Hormone]: true
  },
  graph: GraphType.Bar,
  showLineGraphs: showLineGraphs
});