import * as React from 'react';
import { observer } from 'mobx-react';
import { HorizontalBar } from 'react-chartjs-2';
import { SubstanceType, mysterySubstanceNames } from '../../models/Substance';
import { IOrganelleRef } from '../../models/Organism';
import { isEqual } from 'lodash';
import { rootStore } from '../../stores/RootStore';
import { appStore } from '../../stores/AppStore';
import { assayStore } from '../../stores/AssayStore';
import { stringToEnum } from '../../utils';
import { mysteryOrganelleNames } from '../../models/Organelle';

interface AssayBarProps {
  colors: object;
}

interface AssayBarState {}

@observer
class AssayBarChart extends React.Component<AssayBarProps, AssayBarState> {
  createBars(allAssays: IOrganelleRef[], substanceType: SubstanceType, barNum: number) {
    let bars = [];

    let barColor =  this.props.colors[substanceType];

    const label = appStore.mysteryLabels ?
      mysterySubstanceNames[substanceType] : substanceType;

    bars.push({
      data: allAssays.map(function(assayInfo: IOrganelleRef) {
        let organism = rootStore.organisms.get(assayInfo.organism.id);
        let organelleType = assayInfo.organelleType;
        let substanceLevel = organism.getLevelForOrganelleSubstance(organelleType, substanceType);
        let deltaLevel = organism.getDeltaForOrganelleSubstance(organelleType, substanceType);
        // Shorten any bars with substance removed so total bar length is unchanged
        if (deltaLevel < 0) {
          substanceLevel += deltaLevel;
        }
        return substanceLevel;
      }),
      label,
      backgroundColor: barColor,
      stack: 'Stack ' + barNum
    });

    bars.push({
      data: allAssays.map(function(assayInfo: IOrganelleRef) {
        let organism = rootStore.organisms.get(assayInfo.organism.id);
        let organelleType = assayInfo.organelleType;
        return Math.max(0, organism.getDeltaForOrganelleSubstance(organelleType, substanceType));
      }),
      label: substanceType + ' ADDED#',
      backgroundColor: barColor + 'AA',
      stack: 'Stack ' + barNum
    });

    bars.push({
      data: allAssays.map(function(assayInfo: IOrganelleRef) {
        let organism = rootStore.organisms.get(assayInfo.organism.id);
        let organelleType = assayInfo.organelleType;
        return Math.max(0, organism.getDeltaForOrganelleSubstance(organelleType, substanceType) * -1);
      }),
      label: substanceType + ' SUBTRACTED#',
      backgroundColor: barColor + '44',
      stack: 'Stack ' + barNum
    });
    return bars;
  }

  render() {
    let {visibleSubstances} = assayStore;
    let {activeAssay, lockedAssays} = rootStore;
    let activeSubstances: string[] = visibleSubstances.keys()
      .filter((substanceKey) => visibleSubstances.get(substanceKey));
    let allAssays: IOrganelleRef[] = [];

    let activeGraphed = false;
    lockedAssays.forEach(lockedAssay => {
      allAssays.push(lockedAssay);
      if (activeAssay && isEqual(lockedAssay, activeAssay)) {
        activeGraphed = true;
      }
    });
    if (activeAssay && !activeGraphed) {
      allAssays.push(activeAssay);
    }

    const organelleLabel = (type: string) =>
      appStore.mysteryLabels ? mysteryOrganelleNames[type] : type;

    let data: Chart.ChartData = {
      datasets: [],
      labels: allAssays.map(assay => [assay.organism.id, organelleLabel(assay.organelleType).toLowerCase()]),
    };
    activeSubstances.forEach((activeSubstance, i) => {
      data.datasets = data.datasets.concat(
        this.createBars(allAssays, stringToEnum(activeSubstance, SubstanceType), i));
    });

    let options: any = {
      title: {
        display: true,
        text: 'Substance Amount',
        fontSize: 22
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          filter: (legendItem: any, chartData: any) => {
            // Hidden labels, like for "extra" bars, are marked with a "#"
            return legendItem.text.indexOf('#') === -1;
          },
          boxWidth: 50
        }
      },
      scales: {
        xAxes: [{
          ticks: {
            min: 0,
            max: 800
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
          height={346}
        />
    );
  }
}

export default AssayBarChart;