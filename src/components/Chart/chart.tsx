import * as React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { RaisedButton, Checkbox } from 'material-ui';
import { CellPart, Mode, Substance, AssayInfo } from '../../Types';
import './chart.css';

interface ChartProps {
  substanceLevels: { [cellPart in CellPart]: { [substance in Substance]: number} };
  activeAssay: AssayInfo;
  mode: Mode;
  onAssayToggle(): void;
  onAssayClear(): void;
}

interface ChartState {
  displaySubstances: { [substance in Substance]: boolean};
}

class Chart extends React.Component<ChartProps, ChartState> {
  baseData: Chart.ChartData = {
    datasets: [ { backgroundColor: 'rgba(255, 99, 132, 0.6)'} ]
  };
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

  render() {
    let {substanceLevels, activeAssay} = this.props;
    let {displaySubstances} = this.state;
    let activeSubstances = Object.keys(displaySubstances).filter((substanceKey) => displaySubstances[substanceKey]);

    let values: number[] = [];
    if (activeAssay) {
      values = activeSubstances.map(function(substance: Substance) {
        return substanceLevels[activeAssay.cellPart][substance];
      });
    }
    let data: Chart.ChartData = Object.assign({}, this.baseData);
    data.labels = activeSubstances;
    data.datasets[0].data = values;
    data.datasets[0].label = activeAssay ? activeAssay.cellPart : '';

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
            label={(this.props.mode === Mode.Assay ? 'Confirm' : 'Begin') + ' assay'}
            onClick={this.props.onAssayToggle}
            style={{width: '150px', margin: '5px'}}
            primary={this.props.mode !== Mode.Assay}
            secondary={this.props.mode === Mode.Assay}
          />
          <RaisedButton 
            label={'Clear assays'}
            disabled={this.props.mode === Mode.Assay}
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