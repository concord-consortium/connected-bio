import * as React from 'react';
import { observer } from 'mobx-react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { Mode, View, Substance } from './Types';
import Organism, { OrganelleInfo } from './models/Organism';
import Mouse, { MouseType } from './models/Mouse';
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
  activeAssay: OrganelleInfo;
  lockedAssays: OrganelleInfo[];
  modeParams: any;
  organisms: {[name: string]: Organism};
}

interface AppProps { }

interface ModelProperties {
  albino: boolean;
  working_tyr1: boolean;
  working_myosin_5a: boolean;
  open_gates: boolean;
}

@observer
class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    let organisms = {
      'Field Mouse': new Mouse('Field Mouse', MouseType.Field),
      'Forest Mouse': new Mouse('Forest Mouse', MouseType.Forest)
    };
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
      addEnzyme: false,
      activeAssay: null,
      lockedAssays: [],
      modeParams: {},
      organisms
    };
    this.setActiveAssay = this.setActiveAssay.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleHormoneClick = this.handleHormoneClick.bind(this);
    // this.handleEnzymeClick = this.handleEnzymeClick.bind(this);
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
    let { organisms } = this.state;
    let updatedOrgs = Object.keys(organisms)
      .map(key => organisms[key])
      .map(org => org.step(100))
      .reduce((orgs: object, org: Organism) => {
        orgs[org.getName()] = org;
        return orgs;
      },      {});
    this.setState({organisms: updatedOrgs});

    setTimeout(this.simulationTick, 100);
  }

  setActiveAssay(activeAssay: OrganelleInfo) {
    this.setState({ activeAssay });
  }

  changeSubstanceLevel(organelle: OrganelleInfo) {
    let {substance, amount} = this.state.modeParams;
    let organisms = Object.assign({}, this.state.organisms);
    organisms[organelle.organism.getName()] = 
      organelle.organism.incrementSubstanceLevel(organelle.cellPart, substance, amount);
    this.setState({ organisms });
  }

  handleViewChange(event: any) {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleHormoneClick() {
    this.setState({addHormone: true});
    setTimeout(() => this.setState({addHormone: false}), 500);
  }

  // handleEnzymeClick() {
  //   let newSubstances = Object.assign({}, this.state.substanceLevels);
  //   newSubstances[CellPart.Cytoplasm][Substance.Substance3] = 60;
  //   this.setState({
  //     addEnzyme: true,
  //     modelProperties: {
  //       albino: false,
  //       working_tyr1: true,
  //       working_myosin_5a: true,
  //       open_gates: false
  //     },
  //     substanceLevels: newSubstances
  //   });
  //   setTimeout(() => {
  //     newSubstances = Object.assign({}, this.state.substanceLevels);
  //     newSubstances[CellPart.Cytoplasm][Substance.Substance3] = 30;
  //     this.setState({
  //       addEnzyme: false,
  //       modelProperties: {
  //         albino: false,
  //         working_tyr1: false,
  //         working_myosin_5a: true,
  //         open_gates: false
  //       },
  //       substanceLevels: newSubstances
  //     });
  //   },         4000);
  // }

  handleAssayToggle() {
    if (rootStore.mode === Mode.Assay) {
      rootStore.setMode(Mode.Normal);
      // Lock an assay after it is finished, if one exists
      let { activeAssay } = this.state;
      if (activeAssay) {
        let repeatAssay = this.state.lockedAssays
          .reduce((accumulator: boolean, assay: OrganelleInfo) => {
            return accumulator || isEqual(assay, activeAssay);
          },      false);
        if (!repeatAssay) {
          this.setState({
            lockedAssays: this.state.lockedAssays.concat([activeAssay])
          });
        }
      }
      this.setState({activeAssay: null});
    } else {
      rootStore.setMode(Mode.Assay);
    }
  }

  handleAssayClear() {
    this.setState({ activeAssay: null});
    this.setState({ lockedAssays: [] });
  }

  handleSubstanceManipulatorToggle(manipulationMode: Mode, substance: Substance, amount: number) {
    if (rootStore.mode === Mode.Normal) {
      this.setState({
        modeParams: {substance, amount}
      });
      rootStore.setMode(manipulationMode);
    } else {
      rootStore.setMode(Mode.Normal);
    }
  }

  getBoxView(boxOrg: string, boxView: string) {
    const org: Organism = this.state.organisms[this.state[boxOrg]];
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
          setActiveAssay={this.setActiveAssay}
          currentView={view}
          mode={rootStore.mode}
          organism={org}
          activeAssay={this.state.activeAssay}
          lockedAssays={this.state.lockedAssays}
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
                organisms={this.state.organisms}
                activeAssay={this.state.activeAssay} 
                lockedAssays={this.state.lockedAssays}
                mode={rootStore.mode} 
                onAssayToggle={this.handleAssayToggle}
                onAssayClear={this.handleAssayClear}
              />
              <SubstanceManipulator 
                mode={rootStore.mode} 
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
