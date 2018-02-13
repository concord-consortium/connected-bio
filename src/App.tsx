import * as React from 'react';
import { observer } from 'mobx-react';
import { clone } from 'mobx-state-tree';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { Mode, View, SubstanceType } from './Types';
import { IOrganism, IOrganelleInfo } from './models/Organism';
import { isEqual } from 'lodash';
import { rootStore } from './models/RootStore';

import OrganelleWrapper from './components/organelle-wrapper';
import AssayTool from './components/Assay/AssayTool';
import SubstanceManipulator from './components/SubstanceManipulator/SubstanceManipulator';

interface AppState {
  addHormone: boolean;
  addEnzyme: boolean;
  box1Org: string;
  box1View: View;
  box2Org: string;
  box2View: View;
  modelProperties: ModelProperties;
}

interface AppProps { }

interface ModelProperties {
  albino: boolean;
  working_tyr1: boolean;
  working_myosin_5a: boolean;
  open_gates: boolean;
}

const STEP_MS = 100;

@observer
class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      addHormone: false,
      box1View: View.Cell,
      box1Org: 'Field Mouse',
      box2View: View.Organism,
      box2Org: 'Forest Mouse',
      modelProperties: {
        albino: false,
        working_tyr1: false,
        working_myosin_5a: true,
        open_gates: false
      },
      addEnzyme: false
    };
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleAssayToggle = this.handleAssayToggle.bind(this);
    this.handleAssayClear = this.handleAssayClear.bind(this);
    this.handleSubstanceManipulatorToggle = this.handleSubstanceManipulatorToggle.bind(this);
    this.changeSubstanceLevel = this.changeSubstanceLevel.bind(this);
    this.simulationTick = this.simulationTick.bind(this);
    this.forceDropper = this.forceDropper.bind(this);
  }

  componentDidMount() {
    this.simulationTick(0);
  }

  simulationTick(msPassed: number) {
    rootStore.step(msPassed);
    setTimeout(this.simulationTick.bind(this, STEP_MS), STEP_MS);
  }

  changeSubstanceLevel(organelleRef: IOrganelleInfo) {
    let {substanceType, amount} = rootStore.activeSubstanceManipulation;
    rootStore.organisms.get(organelleRef.organism.id).incrementOrganelleSubstance(
      organelleRef.organelle, substanceType, amount);
  }

  handleViewChange(event: any) {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleAssayToggle() {
    if (rootStore.mode === Mode.Assay) {
      rootStore.setMode(Mode.Normal);
      // Lock an assay after it is finished, if one exists
      let { activeAssay } = rootStore;
      if (activeAssay) {
        let repeatAssay = rootStore.lockedAssays
          .reduce((accumulator: boolean, assay: IOrganelleInfo) => {
            return accumulator || isEqual(assay, activeAssay);
          },      false);
        if (!repeatAssay) {
          rootStore.setLockedAssays(rootStore.lockedAssays.concat([clone(activeAssay)]));
        }
      }
      rootStore.setActiveAssay(null);
    } else {
      rootStore.setMode(Mode.Assay);
    }
  }

  handleAssayClear() {
    rootStore.setActiveAssay(null);
    rootStore.setLockedAssays([]);
  }

  handleSubstanceManipulatorToggle(manipulationMode: Mode, substance: SubstanceType, amount: number) {
    if (rootStore.mode === Mode.Normal) {
      rootStore.setMode(manipulationMode);
      rootStore.setActiveSubstanceManipulation(substance, amount);
    } else {
      rootStore.setMode(Mode.Normal);
    }
  }

  getBoxView(boxOrg: string, boxView: string) {
    const org: IOrganism = rootStore.organisms.get(this.state[boxOrg]);
    const view: View = this.state[boxView];

    if (view === View.None) {
      return null;
    } else if (view === View.Organism) {
      let imgSrc = org.getImageSrc();
      return <img src={imgSrc} width="500px" />;
    } else {
      return (
        <OrganelleWrapper 
          name={boxOrg + '-' + boxView + '-model'}
          modelProperties={this.state.modelProperties} 
          doAddHormone={this.state.addHormone}
          addEnzyme={this.state.addEnzyme}
          currentView={view}
          mode={rootStore.mode}
          organism={org}
          changeSubstanceLevel={this.changeSubstanceLevel}
        />
      );
    }
  }

  forceDropper(e: any) {
    // Force the cell view cursor from default to dropper
    if (e.target.className.indexOf('upper-canvas') > -1) {
      if (this.isModeDropper(rootStore.mode)) {
        e.target.style.cursor = 'url(assets/dropper.png) 6 28, auto';
      } else {
        e.target.style.cursor = 'default';
      }
    }
  }

  isModeDropper(mode: string) {
    return mode === Mode.Assay || mode === Mode.Add || mode === Mode.Subtract;
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className={'App' + (this.isModeDropper(rootStore.mode) ? ' dropper' : '')}>
          <header className="App-header">
            <h1 className="App-title">Connected Bio</h1>
          </header>
          <div className="four-up">
            <div>
              <div>
                <div>
                  <select id="box1Org" value={this.state.box1Org} onChange={this.handleViewChange}>
                    <option value="Field Mouse">Field Mouse</option>
                    <option value="Forest Mouse">Forest Mouse</option>
                  </select>
                  <select id="box1View" value={this.state.box1View} onChange={this.handleViewChange}>
                    <option value={View.None}>None</option>
                    <option value={View.Organism}>Organism</option>
                    <option value={View.Cell}>Cell</option>
                  </select>
                </div>
                <div 
                  className="box" 
                  onClick={this.forceDropper}
                  onMouseUp={this.forceDropper} 
                  onMouseDown={this.forceDropper}  
                  onMouseMove={this.forceDropper}
                >
                  {this.getBoxView('box1Org', 'box1View')}
                </div>
              </div>
              <div>
                <div>
                  <select id="box2Org" value={this.state.box2Org} onChange={this.handleViewChange}>
                    <option value="Field Mouse">Field Mouse</option>
                    <option value="Forest Mouse">Forest Mouse</option>
                  </select>
                  <select id="box2View" value={this.state.box2View} onChange={this.handleViewChange}>
                    <option value={View.None}>None</option>
                    <option value={View.Organism}>Organism</option>
                    <option value={View.Cell}>Cell</option>
                  </select>
                </div>
                <div 
                  className="box" 
                  onClick={this.forceDropper}
                  onMouseUp={this.forceDropper} 
                  onMouseDown={this.forceDropper}  
                  onMouseMove={this.forceDropper}
                >
                  {this.getBoxView('box2Org', 'box2View')}
                </div>
              </div>
            </div>
            <div className="tools">
              <AssayTool 
                onAssayToggle={this.handleAssayToggle}
                onAssayClear={this.handleAssayClear}
              />
              <SubstanceManipulator 
                onSubstanceManipulatorToggle={this.handleSubstanceManipulatorToggle}
              />
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
