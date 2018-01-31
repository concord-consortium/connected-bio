import * as React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { RaisedButton, Checkbox } from 'material-ui';
import { Mode, Substance } from '../../Types';
import Organism, { OrganelleInfo } from '../../models/Organism';
import { isEqual } from 'lodash';
import './chart.css';

interface ChartProps {
  organisms: {[name: string]: Organism};
  activeAssay: OrganelleInfo;
  lockedAssays: OrganelleInfo[];
  mode: Mode;
  onAssayToggle(): void;
  onAssayClear(): void;
}

interface ChartState {
  displaySubstances: { [substance in Substance]: boolean};
}

const defaultColors = ['#3366CC', '#FF9900', '#990099', '#3B3EAC', '#0099C6',
  '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300',
  '#8B0707', '#329262', '#5574A6', '#3B3EAC'];

class Chart extends React.Component<ChartProps, ChartState> {
  constructor(props: any) {
    super(props);
    this.state = {
      displaySubstances: {
        [Substance.Substance1]: false,
        [Substance.Substance2]: true,
        [Substance.Substance3]: true
      }
    };
    this.updateCheck = this.updateCheck.bind(this);
  }

  updateCheck(event: any, isInputChecked: boolean) {
    let newDisplaySubstances = Object.assign({}, this.state.displaySubstances);
    newDisplaySubstances[event.target.id] = isInputChecked;
    this.setState({displaySubstances: newDisplaySubstances});
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
      backgroundColor: defaultColors[barNum % defaultColors.length],
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
    let {activeAssay, lockedAssays, mode} = this.props;
    let {displaySubstances} = this.state;
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
      <div className="chart">
        <HorizontalBar
          data={data}
          options={options}
        />
        <div className="chart-buttons">
          <RaisedButton 
            label={'Add assay'}
            disabled={!(mode === Mode.Normal || mode === Mode.Assay)}
            onClick={this.props.onAssayToggle}
            style={{width: '150px', margin: '5px'}}
            primary={this.props.mode !== Mode.Assay}
            secondary={this.props.mode === Mode.Assay}
          />
          <RaisedButton 
            label={'Clear assays'}
            disabled={!(mode === Mode.Normal)}
            onClick={this.props.onAssayClear}
            style={{width: '150px', margin: '5px'}}
            primary={true}
          />
        </div>
        <div className="chart-boxes">
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances[Substance.Substance1]} 
            id={Substance.Substance1} 
            label={'Substance 1'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances[Substance.Substance2]} 
            id={Substance.Substance2} 
            label={'Substance 2'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances[Substance.Substance3]} 
            id={Substance.Substance3} 
            label={'Substance 3'} 
            onCheck={this.updateCheck} 
          />
        </div>
      </div>
    );
  }
}
  
export default Chart;