import * as React from 'react';
import { observer } from 'mobx-react';
import { RaisedButton, Checkbox } from 'material-ui';
import ClockIcon from 'material-ui/svg-icons/action/alarm-on';
import NoClockIcon from 'material-ui/svg-icons/action/alarm-off';
import { SubstanceType } from '../../models/Substance';
import AssayLineGraph from './AssayLineGraph';
import './AssayTool.css';
import AssayBarChart from './AssayBarChart';
import { rootStore, Mode } from '../../models/RootStore';

interface AssayToolProps {
  onAssayToggle(): void;
  onAssayClear(): void;
}

interface AssayToolState {
  displaySubstances: { [substance in SubstanceType]: boolean};
  graphType: GraphType;
}

enum GraphType {
  Bar, Line
}

const defaultColors = ['#3366CC', '#FF9900', '#990099', '#3B3EAC', '#0099C6',
  '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300',
  '#8B0707', '#329262', '#5574A6', '#3B3EAC'];

@observer
class AssayTool extends React.Component<AssayToolProps, AssayToolState> {
  constructor(props: any) {
    super(props);
    this.state = {
      displaySubstances: {
        [SubstanceType.Substance1]: false,
        [SubstanceType.Substance2]: true,
        [SubstanceType.Substance3]: true
      },
      graphType: GraphType.Bar
    };
    this.updateCheck = this.updateCheck.bind(this);
    this.onGraphSwitch = this.onGraphSwitch.bind(this);
  }

  updateCheck(event: any, isInputChecked: boolean) {
    let newDisplaySubstances = Object.assign({}, this.state.displaySubstances);
    newDisplaySubstances[event.target.id] = isInputChecked;
    this.setState({displaySubstances: newDisplaySubstances});
  }

  onGraphSwitch() {
    if (this.state.graphType === GraphType.Bar) {
      this.setState({graphType: GraphType.Line});
    } else {
      this.setState({graphType: GraphType.Bar});
    }
  }

  render() {
    let {mode, time} = rootStore;
    let {displaySubstances} = this.state;
    let graph = this.state.graphType === GraphType.Line ? (
      <AssayLineGraph
        displaySubstances={displaySubstances}
        colors={defaultColors}
        time={time}
      />) : (
      <AssayBarChart
        displaySubstances={displaySubstances}
        colors={defaultColors}
      />);
    
    return (
      <div className="chart">
        {graph}
        <div className="chart-buttons">
          <RaisedButton 
            label={'Add assay'}
            disabled={!(mode === Mode.Normal || mode === Mode.Assay)}
            onClick={this.props.onAssayToggle}
            style={{width: '150px', margin: '5px'}}
            primary={mode !== Mode.Assay}
            secondary={mode === Mode.Assay}
          />
          <RaisedButton 
            label={'Clear assays'}
            disabled={!(mode === Mode.Normal)}
            onClick={this.props.onAssayClear}
            style={{width: '150px', margin: '5px'}}
            primary={true}
          />
          <RaisedButton 
            disabled={mode !== Mode.Normal}
            onClick={this.onGraphSwitch}
            style={{width: '150px', margin: '5px'}}
            primary={true}
            labelPosition="before"
            icon={this.state.graphType === GraphType.Line ? <NoClockIcon /> : <ClockIcon />}
          />
        </div>
        <div className="chart-boxes">
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances[SubstanceType.Substance1]} 
            id={SubstanceType.Substance1} 
            label={'Substance 1'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances[SubstanceType.Substance2]} 
            id={SubstanceType.Substance2} 
            label={'Substance 2'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '150px'}} 
            checked={this.state.displaySubstances[SubstanceType.Substance3]} 
            id={SubstanceType.Substance3} 
            label={'Substance 3'} 
            onCheck={this.updateCheck} 
          />
        </div>
      </div>
    );
  }
}
  
export default AssayTool;