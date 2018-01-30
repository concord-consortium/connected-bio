import * as React from 'react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { Mode, CellPart, Substance, OrganelleInfo, Mouse } from './Types';

import OrganelleWrapper from './components/organelle-wrapper';
import Chart from './components/Chart/chart';
import SubstanceManipulator from './components/SubstanceManipulator/SubstanceManipulator';

interface AppState {
  addHormone: boolean;
  addEnzyme: boolean;
  box1Org: Mouse;
  box1View: string;
  box2Org: Mouse;
  box2View: string;
  modelProperties: ModelProperties;
  activeAssay: OrganelleInfo;
  lockedAssays: OrganelleInfo[];
  mode: Mode;
  modeParams: any;
  substanceLevels: { [cellPart in CellPart]: { [substance in Substance]: number} };
  substanceDeltas: { [cellPart in CellPart]: { [substance in Substance]: number} };
}

interface AppProps { }

interface ModelProperties {
  albino: boolean;
  working_tyr1: boolean;
  working_myosin_5a: boolean;
  open_gates: boolean;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      addHormone: false,
      box1View: 'cell',
      box1Org: Mouse.Field,
      box2View: 'organism',
      box2Org: Mouse.Forest,
      modelProperties: {
        albino: false,
        working_tyr1: false,
        working_myosin_5a: true,
        open_gates: false
      },
      addEnzyme: false,
      activeAssay: null,
      lockedAssays: [],
      mode: Mode.Normal,
      modeParams: {},
      substanceLevels: {
        [CellPart.Cytoplasm]: {
          [Substance.Substance1]: 20,
          [Substance.Substance2]: 50,
          [Substance.Substance3]: 30
        },
        [CellPart.Nucleus]: {
          [Substance.Substance1]: 90,
          [Substance.Substance2]: 15,
          [Substance.Substance3]: 0
        },
        [CellPart.Golgi]: {
          [Substance.Substance1]: 20,
          [Substance.Substance2]: 50,
          [Substance.Substance3]: 30
        },
        [CellPart.Intercell]: {
          [Substance.Substance1]: 0,
          [Substance.Substance2]: 0,
          [Substance.Substance3]: 70
        },
        [CellPart.Gates]: {
          [Substance.Substance1]: 30,
          [Substance.Substance2]: 50,
          [Substance.Substance3]: 70
        }
      },
      substanceDeltas: this.getClearedSubstanceDeltas()
    };
    this.setActiveAssay = this.setActiveAssay.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleHormoneClick = this.handleHormoneClick.bind(this);
    this.handleEnzymeClick = this.handleEnzymeClick.bind(this);
    this.handleAssayToggle = this.handleAssayToggle.bind(this);
    this.handleAssayClear = this.handleAssayClear.bind(this);
    this.handleSubstanceManipulatorToggle = this.handleSubstanceManipulatorToggle.bind(this);
    this.changeSubstanceLevel = this.changeSubstanceLevel.bind(this);
  }

  getClearedSubstanceDeltas(): any {
    let deltas = {};
    Object.keys(CellPart).forEach((cellPartKey) => {
      deltas[CellPart[cellPartKey]] = {};
      Object.keys(Substance).forEach((substanceKey) => {
        deltas[CellPart[cellPartKey]][Substance[substanceKey]] = 0;
      });
    });
    return deltas;
  }

  setActiveAssay(activeAssay: OrganelleInfo) {
    this.setState({ activeAssay });
  }

  changeSubstanceLevel(organelle: OrganelleInfo) {
    let substanceDeltas = Object.assign({}, this.state.substanceDeltas);
    let {substance, amount} = this.state.modeParams;
    substanceDeltas[organelle.cellPart][substance] += amount;
    this.setState({ substanceDeltas });
  }

  handleViewChange(event: any) {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleHormoneClick() {
    this.setState({addHormone: true});
    setTimeout(() => this.setState({addHormone: false}), 500);
  }

  handleEnzymeClick() {
    let newSubstances = Object.assign({}, this.state.substanceLevels);
    newSubstances[CellPart.Cytoplasm][Substance.Substance3] = 60;
    this.setState({
      addEnzyme: true,
      modelProperties: {
        albino: false,
        working_tyr1: true,
        working_myosin_5a: true,
        open_gates: false
      },
      substanceLevels: newSubstances
    });
    setTimeout(() => {
      newSubstances = Object.assign({}, this.state.substanceLevels);
      newSubstances[CellPart.Cytoplasm][Substance.Substance3] = 30;
      this.setState({
        addEnzyme: false,
        modelProperties: {
          albino: false,
          working_tyr1: false,
          working_myosin_5a: true,
          open_gates: false
        },
        substanceLevels: newSubstances
      });
    },         4000);
  }

  handleAssayToggle() {
    if (this.state.mode === Mode.Assay) {
      this.setState({mode: Mode.Normal});
      // Lock an assay after it is finished, if one exists
      let { activeAssay } = this.state;
      if (activeAssay) {
        let repeatAssay = this.state.lockedAssays
          .reduce((accumulator: boolean, assay: OrganelleInfo) => {
            return accumulator || assay.cellPart === activeAssay.cellPart;
          },      false);
        if (!repeatAssay) {
          this.setState({
            lockedAssays: this.state.lockedAssays.concat([activeAssay])
          });
        }
      }
      this.setState({activeAssay: null});
    } else {
      this.setState({mode: Mode.Assay});
    }
  }

  handleAssayClear() {
    this.setState({ activeAssay: null});
    this.setState({ lockedAssays: [] });
  }

  handleSubstanceManipulatorToggle(manipulationMode: Mode, substance: Substance, amount: number) {
    if (this.state.mode === Mode.Normal) {
      this.setState({
        mode: manipulationMode,
        modeParams: {substance, amount}
      });
    } else {
      this.setState({mode: Mode.Normal});
    }
  }

  getBoxView(boxOrg: string, boxView: string) {
    const org = this.state[boxOrg];
    const view = this.state[boxView];

    if (view === 'none') {
      return null;
    } else if (view === 'organism') {
      let imgSrc = 'assets/sandrat-light.png';
      if (org === Mouse.Forest) {
        imgSrc = 'assets/sandrat-dark.png';
      }
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
          mode={this.state.mode}
          activeAssay={this.state.activeAssay}
          lockedAssays={this.state.lockedAssays}
          changeSubstanceLevel={this.changeSubstanceLevel}
        />
      );
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Connected Bio</h1>
          </header>
          <div className="four-up">
            <div>
              <div>
                <div>
                  <select id="box1Org" value={this.state.box1Org} onChange={this.handleViewChange}>
                    <option value={Mouse.Field}>Field Mouse</option>
                    <option value={Mouse.Forest}>Forest Mouse</option>
                  </select>
                  <select id="box1View" value={this.state.box1View} onChange={this.handleViewChange}>
                    <option value="none">None</option>
                    <option value="organism">Organism</option>
                    <option value="cell">Cell</option>
                  </select>
                </div>
                <div className="box">
                  {this.getBoxView('box1Org', 'box1View')}
                </div>
              </div>
              <div>
                <div>
                  <select id="box2Org" value={this.state.box2Org} onChange={this.handleViewChange}>
                    <option value={Mouse.Field}>Field Mouse</option>
                    <option value={Mouse.Forest}>Forest Mouse</option>
                  </select>
                  <select id="box2View" value={this.state.box2View} onChange={this.handleViewChange}>
                    <option value="none">None</option>
                    <option value="organism">Organism</option>
                    <option value="cell">Cell</option>
                  </select>
                </div>
                <div className="box">
                  {this.getBoxView('box2Org', 'box2View')}
                </div>
              </div>
            </div>
            <div className="tools">
              <Chart 
                substanceLevels={this.state.substanceLevels} 
                substanceDeltas={this.state.substanceDeltas}
                activeAssay={this.state.activeAssay} 
                lockedAssays={this.state.lockedAssays}
                mode={this.state.mode} 
                onAssayToggle={this.handleAssayToggle}
                onAssayClear={this.handleAssayClear}
              />
              <SubstanceManipulator 
                mode={this.state.mode} 
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
