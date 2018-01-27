import * as React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { RaisedButton, Checkbox } from 'material-ui';
import { CellPart, Mode, Substance, OrganelleInfo } from '../../Types';
import './chart.css';

interface ChartProps {
  substanceLevels: { [cellPart in CellPart]: { [substance in Substance]: number} };
  activeAssay: OrganelleInfo;
  lockedAssays: OrganelleInfo[];
  mode: Mode;
  onAssayToggle(): void;
  onAssayClear(): void;
}

interface ChartState {
  displaySubstances: { [substance in Substance]: boolean};
}

const defaultColors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6',
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

  createDataset(activeSubstances: string[], substanceLevels: any, assayInfo: OrganelleInfo, barNum: number) {
    let values = activeSubstances.map(function(substance: Substance) {
      return substanceLevels[assayInfo.cellPart][substance];
    });

    return {
      data: values,
      label: assayInfo.cellPart,
      backgroundColor: defaultColors[barNum % defaultColors.length]
    };
  }

  render() {
    let {substanceLevels, activeAssay, lockedAssays, mode} = this.props;
    let {displaySubstances} = this.state;
    let activeSubstances = Object.keys(displaySubstances).filter((substanceKey) => displaySubstances[substanceKey]);

    let data: Chart.ChartData = {
      datasets: [],
      labels: activeSubstances,
    };
    let activeGraphed = false;
    lockedAssays.forEach((lockedAssay, i) => {
        data.datasets.push(this.createDataset(activeSubstances, substanceLevels, lockedAssay, i));
        if (lockedAssay.cellPart === activeAssay.cellPart) {
          activeGraphed = true;
        }
    });
    if (activeAssay && !activeGraphed) {
      data.datasets.push(this.createDataset(activeSubstances, substanceLevels, activeAssay, lockedAssays.length));
    }
    
    let options: Chart.ChartOptions = {
      title: {
        display: true,
        text: 'Substance Breakdown',
        fontSize: 25
      },
      legend: {
        display: !!activeAssay,
        position: 'bottom'
      },
      scales: {
        xAxes: [{
          ticks: {
            min: 0,
            max: 100
          }
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