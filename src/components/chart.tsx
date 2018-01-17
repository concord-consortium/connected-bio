import * as React from 'react';
import * as Highcharts from 'highcharts';

class Chart extends React.Component<any, any> {
  baseOptions:any = {
    title: {
      text: 'Substance Breakdown',
    },
    xAxis: {
      title: {
        text: "Substance name"
      },
    },
    yAxis: {
      title: {
        text: 'Substance percentage',
      },
    },
    chart: {
      type: 'column',
    },
    credits: {
      enabled: false
    }
  };

  chartEl:any = null;
  chart:any = null;

  componentDidMount() {
    this.createChart(this.props)
  }

  componentWillUnmount() {
    this.chart.destroy();
  }

  componentWillUpdate(nextProps:any) {
    if (nextProps.activeAssay !== this.props.activeAssay) {
      this.createChart(nextProps);
    }
  } 

  componentDidUpdate(prevProps:any) {
    let { substances, activeAssay } = this.props;
    let activeSubstances = substances[activeAssay]
    let values = Object.keys(activeSubstances).map(function(e) {
      return activeSubstances[e]
    })
    this.chart.series[0].setData(values)
  }

  createChart(props:any) {
    let {substances, activeAssay} = props;
    let activeSubstances = substances[activeAssay]
    let values = Object.keys(activeSubstances).map(function(e) {
      return activeSubstances[e]
    })
    let options = Object.assign({}, this.baseOptions, {
      series: [{
        name: activeAssay,
        data: values
      }]
    })
    options.xAxis.categories = Object.keys(activeSubstances)
    this.chart = new Highcharts['Chart'](
      this.chartEl,
      options
    );
  }

  render() {
    return <div ref={el => (this.chartEl = el)} />;
  }
}
  
export default Chart;