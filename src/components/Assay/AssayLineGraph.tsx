import * as React from 'react';
import { clone } from 'mobx-state-tree';
import { Scatter } from 'react-chartjs-2';
import { SubstanceType } from '../../models/Substance';
import { IOrganelleRef } from '../../models/Organism';
import { isEqual } from 'lodash';
import { rootStore } from '../../stores/RootStore';
import { assayStore } from '../../stores/AssayStore';
import { observer } from 'mobx-react';
import { stringToEnum } from '../../utils';

interface AssayLineProps {
  colors: string[];
  time: number;
}

interface AssayLineState {
  organismsOverTime: any[];
}

const MAX_STORED_STATES = 100;

@observer
class AssayLineGraph extends React.Component<AssayLineProps, AssayLineState> {
  constructor(props: any) {
    super(props);
    this.state = {
      organismsOverTime: []
    };
  }

  componentWillReceiveProps(nextProps: AssayLineProps) {
    if (this.props.time < nextProps.time) {
      let nextOrganisms = this.state.organismsOverTime.slice(0);
      if (nextOrganisms.length >= MAX_STORED_STATES) {
        nextOrganisms = [];
      }
      nextOrganisms.push(clone(rootStore.organisms));
      this.setState({
        organismsOverTime: nextOrganisms
      });
    }
  }

  createLine(activeSubstance: SubstanceType, assayInfo: IOrganelleRef, lineNum: number) {
    let data = this.state.organismsOverTime.map((orgs, index) => {
      let organism = orgs.get(assayInfo.organism.id);
      let substanceLevel = organism.getLevelForOrganelleSubstance(assayInfo.organelleType, activeSubstance);
      let substanceDelta = organism.getDeltaForOrganelleSubstance(assayInfo.organelleType, activeSubstance);
      return {
        x: index,
        y: substanceLevel + substanceDelta
      };
    });
    return {
      data,
      label: assayInfo.organism.id + ' ' + assayInfo.organelleType.toLowerCase() + ' ' 
        + activeSubstance.toLowerCase(),
      borderWidth: 3,
      backgroundColor: this.props.colors[lineNum],
      borderColor: this.props.colors[lineNum],
      fill: false,
      tension: 0
    };
  }

  render() {
    let {visibleSubstances} = assayStore;
    let {activeAssay, lockedAssays} = rootStore;
    let activeSubstances = visibleSubstances.keys()
      .filter((substanceKey) => visibleSubstances.get(substanceKey))
      .map((activeSubstance) => 
        stringToEnum(activeSubstance, SubstanceType));

    let data: any = {
      datasets: []
    };

    let activeGraphed = false;
    for (let i = 0; i < lockedAssays.length; i++) {
      for (let j = 0; j < activeSubstances.length; j++) {
        data.datasets = data.datasets.concat(
          this.createLine(activeSubstances[j], lockedAssays[i], data.datasets.length));

        if (activeAssay && isEqual(activeAssay, lockedAssays[i])) {
          activeGraphed = true;
        }
      }
    }

    if (activeAssay && !activeGraphed) {
      for (let i = 0; i < activeSubstances.length; i++) {
        data.datasets = data.datasets.concat(
          this.createLine(activeSubstances[i], activeAssay, data.datasets.length)
        );
      }
    }
    
    let options: any = {
      title: {
        display: true,
        text: 'SubstanceType Breakdown Over Time',
        fontSize: 25
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      scales: {
        display: false,
        yAxes: [{
          ticks: {
            min: 0,
            max: 800
          }
        }],
        xAxes: [{
          display: false,
          ticks: {
            min: 0,
            max: MAX_STORED_STATES
          }
        }]
      },
      elements: { point: { radius: 0 } },
      showLines: true
    };
    return (
        <Scatter
          data={data}
          options={options}
        />
    );
  }
}
  
export default AssayLineGraph;