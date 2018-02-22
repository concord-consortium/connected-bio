import * as React from 'react';
import { observer } from 'mobx-react';
import { RaisedButton, /*Checkbox*/ } from 'material-ui';
import ClockIcon from 'material-ui/svg-icons/action/alarm-on';
import NoClockIcon from 'material-ui/svg-icons/action/alarm-off';
import { SubstanceType } from '../../models/Substance';
import AssayLineGraph from './AssayLineGraph';
import './AssayTool.css';
import AssayBarChart from './AssayBarChart';
import { rootStore, Mode } from '../../stores/RootStore';
import { assayStore, GraphType } from '../../stores/AssayStore';
import { stringToEnum } from '../../utils';

interface AssayToolProps {
  onAssayToggle(): void;
  onAssayClear(): void;
}

interface AssayToolState {}

const defaultColors = ['#3366CC', '#DC3912', '#FF9900', '#990099', '#3B3EAC', '#0099C6',
  '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300',
  '#8B0707', '#329262', '#5574A6', '#3B3EAC'];

@observer
class AssayTool extends React.Component<AssayToolProps, AssayToolState> {
  constructor(props: any) {
    super(props);
    this.updateCheck = this.updateCheck.bind(this);
    this.onGraphSwitch = this.onGraphSwitch.bind(this);
  }

  updateCheck(event: any, isInputChecked: boolean) {
    let substanceType = stringToEnum(event.target.id, SubstanceType);
    assayStore.setSubstanceVisibility(substanceType, isInputChecked);
  }

  onGraphSwitch() {
    if (assayStore.graphType === GraphType.Bar) {
      assayStore.setGraphType(GraphType.Line);
    } else {
      assayStore.setGraphType(GraphType.Bar);
    }
  }

  render() {
    let {mode, time} = rootStore;
    let graph = assayStore.graphType === GraphType.Line ? (
      <AssayLineGraph
        colors={defaultColors}
        time={time}
      />) : (
      <AssayBarChart
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
            icon={assayStore.graphType === GraphType.Line ? <NoClockIcon /> : <ClockIcon />}
          />
        </div>
        {/*
        <div className="chart-boxes">
          <Checkbox 
            style={{width: '200px'}} 
            checked={assayStore.visibleSubstances.get(SubstanceType.Hormone)} 
            id={SubstanceType.Hormone} 
            label={'Hormone'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '200px'}} 
            checked={assayStore.visibleSubstances.get(SubstanceType.GProtein)} 
            id={SubstanceType.GProtein} 
            label={'Activated G-Protein'} 
            onCheck={this.updateCheck} 
          />
          <Checkbox 
            style={{width: '200px'}} 
            checked={assayStore.visibleSubstances.get(SubstanceType.Eumelanin)} 
            id={SubstanceType.Eumelanin} 
            label={'Eumelanin'} 
            onCheck={this.updateCheck} 
          />
        </div>
        */}
      </div>
    );
  }
}
  
export default AssayTool;