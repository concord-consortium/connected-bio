import * as React from 'react';
import { RaisedButton, Checkbox } from 'material-ui';
import { Mode, Substance } from '../../Types';
import Organism, { OrganelleInfo } from '../../models/Organism';
import AssayLineGraph from './AssayLineGraph';
import './AssayTool.css';

interface AssayToolProps {
  organisms: {[name: string]: Organism};
  activeAssay: OrganelleInfo;
  lockedAssays: OrganelleInfo[];
  mode: Mode;
  onAssayToggle(): void;
  onAssayClear(): void;
}

interface AssayToolState {
  displaySubstances: { [substance in Substance]: boolean};
}

const defaultColors = ['#3366CC', '#FF9900', '#990099', '#3B3EAC', '#0099C6',
  '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300',
  '#8B0707', '#329262', '#5574A6', '#3B3EAC'];

class AssayTool extends React.Component<AssayToolProps, AssayToolState> {
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
    let {activeAssay, lockedAssays, mode, organisms} = this.props;
    let {displaySubstances} = this.state;
    
    return (
      <div className="chart">
        <AssayLineGraph
          organisms={organisms}
          activeAssay={activeAssay}
          lockedAssays={lockedAssays}
          displaySubstances={displaySubstances}
          colors={defaultColors}
        />
        <div className="chart-buttons">
          <RaisedButton 
            label={'Add assay'}
            disabled={!(mode === Mode.Normal || mode === Mode.Assay)}
            onClick={this.props.onAssayToggle}
            style={{width: '150px', margin: '5px'}}
            primary={this.props.mode !== Mode.Assay}
            secondary={this.props.mode === Mode.Assay}
          />
          <RaisedButton 
            label={'Clear assays'}
            disabled={!(mode === Mode.Normal)}
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
  
export default AssayTool;