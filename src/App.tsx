import * as React from 'react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { Mode, CellPart, Substance, AssayInfo } from './Types';

import OrganelleWrapper from './components/organelle-wrapper';
import Chart from './components/Chart/chart';

interface AppState {
  addHormone: boolean;
  addEnzyme: boolean;
  box1: string;
  box2: string;
  modelProperties: ModelProperties;
  activeAssay: AssayInfo;
  lockedAssays: AssayInfo[];
  mode: Mode;
  substanceLevels: { [cellPart in CellPart]: { [substance in Substance]: number} };
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
      box1: 'cell',
      box2: 'organism',
      modelProperties: {
        albino: false,
        working_tyr1: false,
        working_myosin_5a: true,
        open_gates: false
      },
      addEnzyme: false,
      activeAssay: { cellPart: CellPart.None },
      lockedAssays: [],
      mode: Mode.Normal,
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
        },
        [CellPart.None]: {
          [Substance.Substance1]: 0,
          [Substance.Substance2]: 0,
          [Substance.Substance3]: 0,
        }
      }
    };
    this.setActiveAssay = this.setActiveAssay.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleHormoneClick = this.handleHormoneClick.bind(this);
    this.handleEnzymeClick = this.handleEnzymeClick.bind(this);
    this.handleAssayToggle = this.handleAssayToggle.bind(this);
    this.handleAssayClear = this.handleAssayClear.bind(this);
  }

  setActiveAssay(activeAssay: AssayInfo) {
    this.setState({ activeAssay });
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
      if (activeAssay.cellPart !== CellPart.None) {
        this.setState({
          lockedAssays: this.state.lockedAssays.concat([activeAssay])
        });
      }
    } else {
      this.setState({mode: Mode.Assay});
    }
  }

  handleAssayClear() {
    this.setState({ activeAssay: { cellPart: CellPart.None }});
  }

  getBoxView(boxId: any) {
    const opt = this.state[boxId];

    if (opt === 'none') {
      return null;
    } else if (opt === 'organism') {
      let imgSrc = 'assets/sandrat-light.png';
      if (this.state.addEnzyme) {
        imgSrc = 'assets/sandrat-dark.png';
      }
      return <img src={imgSrc} width="500px" />;
    } else {
      return (
        <OrganelleWrapper 
          name={boxId + '-model'}
          modelProperties={this.state.modelProperties} 
          doAddHormone={this.state.addHormone}
          addEnzyme={this.state.addEnzyme}
          setActiveAssay={this.setActiveAssay}
          currentView={opt}
          mode={this.state.mode}
          activeAssay={this.state.activeAssay}
          lockedAssays={this.state.lockedAssays}
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
                  <select id="box1" value={this.state.box1} onChange={this.handleViewChange}>
                    <option value="none">None</option>
                    <option value="organism">Organism</option>
                    <option value="cell">Cell</option>
                  </select>
                </div>
                <div className="box">
                  {this.getBoxView('box1')}
                </div>
              </div>
              <div>
                <div>
                  <select id="box2" value={this.state.box2} onChange={this.handleViewChange}>
                    <option value="none">None</option>
                    <option value="organism">Organism</option>
                    <option value="cell">Cell</option>
                  </select>
                </div>
                <div className="box">
                  {this.getBoxView('box2')}
                </div>
              </div>
            </div>
            <Chart 
              substanceLevels={this.state.substanceLevels} 
              activeAssay={this.state.activeAssay} 
              mode={this.state.mode} 
              onAssayToggle={this.handleAssayToggle}
              onAssayClear={this.handleAssayClear}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
