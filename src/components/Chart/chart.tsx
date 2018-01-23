import * as React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { RaisedButton } from 'material-ui';
import './chart.css';

class Chart extends React.Component<any, any> {
  baseData: any = {
    datasets: [ {} ]
  };

  render() {
    let {substances, activeAssay} = this.props;
    let activeSubstances = substances[activeAssay];
    let values = Object.keys(activeSubstances).map(function(e: any) {
      return activeSubstances[e];
    });
    let data: any = Object.assign({}, this.baseData);
    data.labels = Object.keys(activeSubstances);
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
            beginAtZero: true
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
            onClick={this.props.onAssayClear}
            style={{width: '150px', margin: '5px'}}
            primary={true}
          />
        </div>
      </div>
    );
  }
}
  
export default Chart;