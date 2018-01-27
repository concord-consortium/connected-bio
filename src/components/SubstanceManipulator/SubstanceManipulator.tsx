import * as React from 'react';
import './SubstanceManipulator.css';
import { RaisedButton } from 'material-ui';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { Substance, Mode } from '../../Types';

interface SubstanceManipulatorProps {
  mode: Mode;
  onSubstanceManipulatorToggle(manipulationMode: Mode, substance: Substance, amount: number): void;
}

interface SubstanceManipulatorState {
  selectedSubstance: Substance;
}

const SUBSTANCE_DELTA: number = 5;

class SubstanceManipulator extends React.Component<SubstanceManipulatorProps, SubstanceManipulatorState> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedSubstance: Substance.Substance1
    };
    this.updateSelection = this.updateSelection.bind(this);
    this.handleAddModeToggle = this.handleAddModeToggle.bind(this);
    this.handleSubtractModeToggle = this.handleSubtractModeToggle.bind(this);
  }

  updateSelection(event: object, value: undefined) {
    this.setState({
      selectedSubstance: value
    });
  }

  handleAddModeToggle() {
    this.props.onSubstanceManipulatorToggle(Mode.Add, this.state.selectedSubstance, SUBSTANCE_DELTA);
  }

  handleSubtractModeToggle() {
    this.props.onSubstanceManipulatorToggle(Mode.Subtract, this.state.selectedSubstance, SUBSTANCE_DELTA * -1);
  }

  render() {
    let {mode} = this.props;
    return (
      <div className="substance-manipulator">
        <div className="substance-buttons">
          <RaisedButton 
            label={'Add substance'}
            onClick={this.handleAddModeToggle}
            disabled={!(mode === Mode.Normal || mode === Mode.Add)}
            style={{width: '200px', margin: '5px'}}
            primary={this.props.mode !== Mode.Add}
            secondary={this.props.mode === Mode.Add}
          />
          <RaisedButton 
            label={'Subtract substance'}
            onClick={this.handleSubtractModeToggle}
            disabled={!(mode === Mode.Normal || mode === Mode.Subtract)}
            style={{width: '200px', margin: '5px'}}
            primary={this.props.mode !== Mode.Subtract}
            secondary={this.props.mode === Mode.Subtract}
          />
        </div>
        <RadioButtonGroup 
          name="substance-picker" 
          defaultSelected={this.state.selectedSubstance} 
          onChange={this.updateSelection}
        >
          <RadioButton
            style={{width: '150px'}} 
            value={Substance.Substance1}
            label="Substance 1"
            disabled={mode !== Mode.Normal}
          />
          <RadioButton
            style={{width: '150px'}} 
            value={Substance.Substance2}
            label="Substance 2"
            disabled={mode !== Mode.Normal}
          />
          <RadioButton
            style={{width: '150px'}} 
            value={Substance.Substance3}
            label="Substance 3"
            disabled={mode !== Mode.Normal}
          />
        </RadioButtonGroup>
      </div>
    );
  }
}
  
export default SubstanceManipulator;