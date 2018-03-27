import * as React from 'react';
import { clone } from 'mobx-state-tree';
import { Scatter } from 'react-chartjs-2';
import { SubstanceType } from '../../models/Substance';
import { IOrganelleRef } from '../../models/Organism';
import { rootStore } from '../../stores/RootStore';
import { assayStore } from '../../stores/AssayStore';
import { observer } from 'mobx-react';
import { stringToEnum } from '../../utils';

interface AssayLineProps {
  colors: object;
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
      let val = substanceLevel + substanceDelta;
      if (val <= 0) {
        // hide lines with value 0 by shoving them well below axis
        val -= 100;
      }
      return {
        x: index,
        y: val
      };
    });
    let color =  this.props.colors[activeSubstance];
    return {
      data,
      label: activeSubstance,
      borderWidth: 3,
      backgroundColor: color,
      borderColor: color,
      fill: false,
      tension: 0
    };
  }

  render() {
    const {visibleSubstances} = assayStore;
    const {lockedAssays} = rootStore;
    const activeSubstances = visibleSubstances.keys()
      .filter((substanceKey) => visibleSubstances.get(substanceKey))
      .map((activeSubstance) =>
        stringToEnum(activeSubstance, SubstanceType));

    const graphs: JSX.Element[] = [];

    const chartTitle = {
      display: true,
      text: 'Substance Amount Over Time',
      fontSize: 22
    };

    const chartLegend = {
      display: true,
      position: 'bottom',
    };

    const defaultOptions: any = {
      title: chartTitle,
      legend: chartLegend,
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

    lockedAssays.forEach((lockedAssay, i) => {
      const data: any = {
        datasets: []
      };

      for (let j = 0; j < activeSubstances.length; j++) {
        data.datasets = data.datasets.concat(
          this.createLine(activeSubstances[j], lockedAssay, data.datasets.length));
      }

      const title = i === 0 ? chartTitle : null;

      const legend = i === lockedAssays.length - 1 ? chartLegend : {
        display: false
      };

      let height = lockedAssays.length < 3 ?
            430 / lockedAssays.length : 410 / lockedAssays.length;
      if (i === 0) {
        height += 20;
      }
      if (i === lockedAssays.length - 1) {
        height += 30;
      }
      const yAxisFontSize = lockedAssays.length < 3 ? 12 :
      lockedAssays.length < 4 ? 10 : 8;

      const options: any = Object.assign({}, defaultOptions, {
        title,
        legend,
        scales: {
          display: false,
          yAxes: [{
            ticks: {
              min: 0,
              max: 800
            },
            scaleLabel: {
              display: true,
              fontSize: yAxisFontSize,
              labelString: lockedAssays[i].organism.id + ' ' + lockedAssay.organelleType.toLowerCase()
            }
          }],
          xAxes: [{
            display: false,
            ticks: {
              min: 0,
              max: MAX_STORED_STATES
            }
          }]
        }
      });

      graphs.push(
          <Scatter
            key={i}
            data={data}
            options={options}
            height={height}
            width={400}
          />
      );
    });

    if (lockedAssays.length === 0) {
      const data: any = {
        datasets: []
      };
      graphs.push(
        <Scatter
          key="0"
          data={data}
          options={defaultOptions}
          height={485}
          width={400}
        />
    );
    }

    return (
      <div>
        {graphs}
      </div>
    );
  }
}

export default AssayLineGraph;