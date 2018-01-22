import * as React from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import { RaisedButton } from 'material-ui';
import './chart.css';

class Chart extends React.Component<any, any> {
  baseData: any = {
    datasets: [
      {
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ]
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
    let options: any = {
      title: {
        display: true,
        text: 'Substance Breakdown',
        fontSize: 25
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };
    return (
      <div className="chart">
        <HorizontalBar
          data={data}
          options={options}
        />
        <RaisedButton 
          label={(this.props.mode === 'assay' ? 'End' : 'Begin') + ' assay'}
          onClick={this.props.onAssayClick}
          style={{width: '150px', margin: '5px'}}
          primary={this.props.mode !== 'assay'}
          secondary={this.props.mode === 'assay'}
        />
      </div>
    );
  }
}
  
export default Chart;