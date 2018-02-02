import * as React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Substance } from '../../Types';
import Organism, { OrganelleInfo } from '../../models/Organism';
import { isEqual } from 'lodash';

interface AssayLineProps {
  organisms: {[name: string]: Organism};
  activeAssay: OrganelleInfo;
  lockedAssays: OrganelleInfo[];
  displaySubstances: { [substance in Substance]: boolean};
  colors: string[];
}

interface AssayLineState {
  organismsOverTime: {[name: string]: Organism}[];
}

const MAX_STORED_STATES = 100;

class AssayLineGraph extends React.Component<AssayLineProps, AssayLineState> {
  constructor(props: any) {
    super(props);
    this.state = {
      organismsOverTime: []
    };
  }

  componentWillReceiveProps(nextProps: AssayLineProps) {
    let nextOrganisms = this.state.organismsOverTime.slice(0);
    nextOrganisms.push(nextProps.organisms);
    if (nextOrganisms.length > MAX_STORED_STATES) {
      nextOrganisms.splice(0, 1);
    }
    this.setState({
      organismsOverTime: nextOrganisms
    });
  }

  createBar(activeSubstances: string[], assayInfo: OrganelleInfo, barNum: number) {
    let organism = this.props.organisms[assayInfo.organism.getName()];
    let substanceLevels = organism.getSubstanceLevels();
    let substanceDeltas = organism.getSubstanceDeltas();
    let bars = [];
    bars.push({
      data: activeSubstances.map(function(substance: Substance) {
              let substanceLevel = substanceLevels[assayInfo.cellPart][substance];
              let deltaLevel = substanceDeltas[assayInfo.cellPart][substance];
              // Shorten any bars with substance removed so total bar length is unchanged
              if (deltaLevel < 0) {
                substanceLevel += deltaLevel;
              }
              return substanceLevel;
            }),
      label: organism.getName() + ' ' + assayInfo.cellPart.toLowerCase(),
      backgroundColor: this.props.colors[barNum % this.props.colors.length],
      stack: 'Stack ' + barNum
    });

    bars.push({
      data: activeSubstances.map(function(substance: Substance) {
              return Math.max(0, substanceDeltas[assayInfo.cellPart][substance]);
            }),
      label: organism.getName() + ' ' + assayInfo.cellPart + ' ADDED#',
      backgroundColor: 'green',
      stack: 'Stack ' + barNum
    });

    bars.push({
      data: activeSubstances.map(function(substance: Substance) {
              return Math.max(0, substanceDeltas[assayInfo.cellPart][substance] * -1);
            }),
      label: organism.getName() + ' ' + assayInfo.cellPart + ' SUBTRACTED#',
      backgroundColor: 'red',
      stack: 'Stack ' + barNum
    });
    return bars;
  }

  createLine(activeSubstance: string, assayInfo: OrganelleInfo, lineNum: number) {
    let data = this.state.organismsOverTime.map((organisms, index) => {
      let organism = organisms[assayInfo.organism.getName()];
      let substanceLevels = organism.getSubstanceLevels();
      let substanceDeltas = organism.getSubstanceDeltas();
      return {
        x: index,
        y: substanceLevels[assayInfo.cellPart][activeSubstance] + substanceDeltas[assayInfo.cellPart][activeSubstance]
      };
    });
    return {
      data,
      label: assayInfo.organism.getName() + ' ' + assayInfo.cellPart.toLowerCase() + ' ' 
        + activeSubstance.toLowerCase(),
      borderWidth: 3,
      backgroundColor: this.props.colors[lineNum],
      borderColor: this.props.colors[lineNum],
      fill: false,
      tension: 0
    };
  }

  render() {
    let {activeAssay, lockedAssays, displaySubstances} = this.props;
    let activeSubstances = Object.keys(displaySubstances).filter((substanceKey) => displaySubstances[substanceKey]);

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
        text: 'Substance Breakdown Over Time',
        fontSize: 25
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 100
          }
        }],
        xAxes: [{
          display: false,
          ticks: {
            min: 0
          }
        }]
      },
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