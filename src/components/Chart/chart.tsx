import * as React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { RaisedButton, Checkbox } from 'material-ui';
import './chart.css';

class Chart extends React.Component<any, any> {
  baseData: any = {
    datasets: [ {} ]
  };
  constructor(props: any) {
    super(props);
    this.state = {
      displaySubstances: {
        substance1: false,
        substance2: true,
        substance3: true
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
    let {substances, activeAssay} = this.props;
    let {displaySubstances} = this.state;
    let activeSubstances = Object.keys(displaySubstances).filter((substanceKey) => displaySubstances[substanceKey]);
    let values = activeSubstances.map(function(e: any) {
      return substances[activeAssay][e];
    });
    let data: any = Object.assign({}, this.baseData);
    data.labels = activeSubstances;
    data.datasets[0].data = values;
    data.datasets[0].label = activeAssay;

    let color = activeAssay === 'none' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 99, 132, 0.6)';
    data.datasets[0].backgroundColor = color;
    let options: any = {
      title: {
        display: true,
        text: 'Substance Breakdown',
        fontSize: 25
      },
      legend: {
        display: activeAssay !== 'none',
        position: 'bottom'
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
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
            label={(this.props.mode === 'assay' ? 'Confirm' : 'Begin') + ' assay'}
            onClick={this.props.onAssayToggle}
            style={{width: '150px', margin: '5px'}}
            primary={this.props.mode !== 'assay'}
            secondary={this.props.mode === 'assay'}
          />
          <RaisedButton 
            label={'Clear assays'}
            disabled={this.props.mode === 'assay'}
            onClick={this.props.onAssayClear}
            style={{width: '150px', margin: '5px'}}
            primary={true}
          />
        </div>
        <div className="chart-boxes">
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances.substance1} 
            id={'substance1'} 
            label={'Substance 1'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances.substance2} 
            id={'substance2'} 
            label={'Substance 2'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances.substance3} 
            id={'substance3'} 
            label={'Substance 3'} 
            onCheck={this.updateCheck} 
          />
        </div>
      </div>
    );
  }
}
  
export default Chart;