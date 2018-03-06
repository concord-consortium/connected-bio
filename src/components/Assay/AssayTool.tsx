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

const colors = {
  [SubstanceType.Hormone]: '#0adbd7',
  [SubstanceType.GProtein]: '#d88bff',
  [SubstanceType.Eumelanin]: '#795423',
  [SubstanceType.Pheomelanin]: '#f4ce83'
};

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
        key={rootStore.lockedAssays.length}
        colors={colors}
        time={time}
      />) : (
      <AssayBarChart
        colors={colors}
      />);

    return (
      <div className="chart">
        {graph}
        <div className="chart-buttons">
          <RaisedButton
            label={'Add assay'}
            disabled={!(mode === Mode.Normal || mode === Mode.Assay)}
            onClick={this.props.onAssayToggle}
            style={{width: '120px', margin: '5px'}}
            labelStyle={{ fontSize: '11px'}}
            primary={mode !== Mode.Assay}
            secondary={mode === Mode.Assay}
          />
          <RaisedButton
            label={'Clear assays'}
            disabled={!(mode === Mode.Normal)}
            onClick={this.props.onAssayClear}
            style={{width: '120px', margin: '5px'}}
            labelStyle={{ fontSize: '11px'}}
            primary={true}
          />
          <RaisedButton
            disabled={mode !== Mode.Normal}
            onClick={this.onGraphSwitch}
            style={{width: '120px', margin: '5px'}}
            labelStyle={{ fontSize: '11px'}}
            primary={true}
            labelPosition="before"
            icon={assayStore.graphType === GraphType.Line ? <NoClockIcon /> : <ClockIcon />}
          />
        </div>
      </div>
    );
  }
}

export default AssayTool;