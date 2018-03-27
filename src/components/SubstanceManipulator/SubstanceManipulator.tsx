import * as React from 'react';
import { observer } from 'mobx-react';
import './SubstanceManipulator.css';
import { RaisedButton } from 'material-ui';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { SubstanceType } from '../../models/Substance';
import { rootStore, Mode } from '../../stores/RootStore';

interface SubstanceManipulatorProps {}

interface SubstanceManipulatorState {
  selectedSubstance: SubstanceType;
}

const SUBSTANCE_DELTA: number = 200;

@observer
class SubstanceManipulator extends React.Component<SubstanceManipulatorProps, SubstanceManipulatorState> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedSubstance: SubstanceType.Hormone
    };
    this.updateSelection = this.updateSelection.bind(this);
    this.handleAddModeToggle = this.handleAddModeToggle.bind(this);
    this.handleSubtractModeToggle = this.handleSubtractModeToggle.bind(this);
  }

  updateSelection(event: object, value: undefined) {
    this.setState({
      selectedSubstance: value
    });
    rootStore.setActiveSubstance(value);
  }

  handleAddModeToggle() {
    rootStore.toggleSubstanceManipulator(Mode.Add, SUBSTANCE_DELTA);
  }

  handleSubtractModeToggle() {
    rootStore.toggleSubstanceManipulator(Mode.Subtract, SUBSTANCE_DELTA * -1);
  }

  render() {
    let {mode} = rootStore;
    return (
      <div className="substance-manipulator">
        <div className="substance-buttons">
          <RaisedButton
            label={'Add substance'}
            onClick={this.handleAddModeToggle}
            disabled={!(mode === Mode.Normal || mode === Mode.Add)}
            style={{width: '150px', margin: '5px'}}
            labelStyle={{ fontSize: '11px'}}
            primary={mode !== Mode.Add}
            secondary={mode === Mode.Add}
          />
          <RaisedButton
            label={'Remove substance'}
            onClick={this.handleSubtractModeToggle}
            disabled={!(mode === Mode.Normal || mode === Mode.Subtract)}
            style={{width: '150px', margin: '5px'}}
            labelStyle={{ fontSize: '11px'}}
            primary={mode !== Mode.Subtract}
            secondary={mode === Mode.Subtract}
          />
        </div>
        <RadioButtonGroup
          name="substance-picker"
          defaultSelected={this.state.selectedSubstance}
          onChange={this.updateSelection}
        >
          <RadioButton
            style={{width: '200px'}}
            labelStyle={{ fontSize: '12px'}}
            value={SubstanceType.Hormone}
            label="Hormone"
            disabled={!(mode === Mode.Normal || mode === Mode.Add || mode === Mode.Subtract)}
          />
          <RadioButton
            style={{width: '200px'}}
            labelStyle={{ fontSize: '12px'}}
            value={SubstanceType.SignalProtein}
            label="Signal Protein"
            disabled={!(mode === Mode.Normal || mode === Mode.Add || mode === Mode.Subtract)}
          />
          <RadioButton
            style={{width: '200px'}}
            labelStyle={{ fontSize: '12px'}}
            value={SubstanceType.Eumelanin}
            label="Eumelanin"
            disabled={!(mode === Mode.Normal || mode === Mode.Add || mode === Mode.Subtract)}
          />
          <RadioButton
            style={{width: '200px'}}
            labelStyle={{ fontSize: '12px'}}
            value={SubstanceType.Pheomelanin}
            label="Pheomelanin"
            disabled={!(mode === Mode.Normal || mode === Mode.Add || mode === Mode.Subtract)}
          />
        </RadioButtonGroup>
      </div>
    );
  }
}

export default SubstanceManipulator;