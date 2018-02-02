import * as React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { Substance } from '../../Types';
import Organism, { OrganelleInfo } from '../../models/Organism';
import { isEqual } from 'lodash';

interface AssayBarProps {
  organisms: {[name: string]: Organism};
  activeAssay: OrganelleInfo;
  lockedAssays: OrganelleInfo[];
  displaySubstances: { [substance in Substance]: boolean};
  colors: string[];
}

interface AssayBarState {}

class AssayBarChart extends React.Component<AssayBarProps, AssayBarState> {
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

  render() {
    let {activeAssay, lockedAssays, displaySubstances} = this.props;
    let activeSubstances = Object.keys(displaySubstances).filter((substanceKey) => displaySubstances[substanceKey]);

    let data: Chart.ChartData = {
      datasets: [],
      labels: activeSubstances,
    };
    let activeGraphed = false;
    lockedAssays.forEach((lockedAssay, i) => {
        data.datasets = data.datasets.concat(this.createBar(activeSubstances, lockedAssay, i));
        if (activeAssay && isEqual(lockedAssay, activeAssay)) {
          activeGraphed = true;
        }
    });
    if (activeAssay && !activeGraphed) {
      data.datasets = data.datasets.concat(
        this.createBar(activeSubstances, activeAssay, lockedAssays.length));
    }
    
    let options: any = {
      title: {
        display: true,
        text: 'Substance Breakdown',
        fontSize: 25
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          filter: (legendItem: any, chartData: any) => {
            // Hidden labels, like for "extra" bars, are marked with a "#"
            return legendItem.text.indexOf('#') === -1;
          }
        }
      },
      scales: {
        xAxes: [{
          ticks: {
            min: 0,
            max: 100
          },
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      },
      tooltips: {
        enabled: false
      }
    };
    return (
        <HorizontalBar
          data={data}
          options={options}
        />
    );
  }
}
  
export default AssayBarChart;