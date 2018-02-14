import * as React from 'react';
import { observer } from 'mobx-react';
import { HorizontalBar } from 'react-chartjs-2';
import { SubstanceType } from '../../models/Substance';
import { IOrganelleRef } from '../../models/Organism';
import { isEqual } from 'lodash';
import { rootStore } from '../../stores/RootStore';

interface AssayBarProps {
  displaySubstances: { [substance in SubstanceType]: boolean};
  colors: string[];
}

interface AssayBarState {}

@observer
class AssayBarChart extends React.Component<AssayBarProps, AssayBarState> {
  createBar(activeSubstances: string[], assayInfo: IOrganelleRef, barNum: number) {
    let organism = rootStore.organisms.get(assayInfo.organism.id);
    let organelleType = assayInfo.organelleType;
    let bars = [];
    
    let barColor = this.props.colors[barNum % this.props.colors.length];
    bars.push({
      data: activeSubstances.map(function(substance: SubstanceType) {
              let substanceLevel = organism.getLevelForOrganelleSubstance(organelleType, substance);
              let deltaLevel = organism.getDeltaForOrganelleSubstance(organelleType, substance);
              // Shorten any bars with substance removed so total bar length is unchanged
              if (deltaLevel < 0) {
                substanceLevel += deltaLevel;
              }
              return substanceLevel;
            }),
      label: organism.id + ' ' + assayInfo.organelleType.toLowerCase(),
      backgroundColor: barColor,
      stack: 'Stack ' + barNum
    });

    bars.push({
      data: activeSubstances.map(function(substance: SubstanceType) {
              return Math.max(0, organism.getDeltaForOrganelleSubstance(organelleType, substance));
            }),
      label: organism.id + ' ' + assayInfo.organelleType + ' ADDED#',
      backgroundColor: 'green',
      stack: 'Stack ' + barNum
    });

    bars.push({
      data: activeSubstances.map(function(substance: SubstanceType) {
              return Math.max(0, organism.getDeltaForOrganelleSubstance(organelleType, substance) * -1);
            }),
      label: organism.id + ' ' + assayInfo.organelleType + ' SUBTRACTED#',
      backgroundColor: barColor + '77',
      stack: 'Stack ' + barNum
    });
    return bars;
  }

  render() {
    let {displaySubstances} = this.props;
    let {activeAssay, lockedAssays} = rootStore;
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
        text: 'SubstanceType Breakdown',
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