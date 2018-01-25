import * as React from 'react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';

import OrganelleWrapper from './components/organelle-wrapper';
import Chart from './components/Chart/chart';

export enum Mode {
  Normal = 'NORMAL',
  Assay = 'ASSAY'
}

export enum CellPart {
  Nucleus = 'NUCLEUS',
  Cytoplasm = 'CYTOPLASM',
  Golgi = 'GOLGI',
  Gates = 'GATES',
  Intercell = 'INTERCELL',
  None = 'NONE'
}

interface AppState {
  addHormone: boolean;
  addEnzyme: boolean;
  box1: string;
  box2: string;
  modelProperties: ModelProperties;
  activeAssay: CellPart;
  mode: Mode;
  substanceLevels: any;
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
      activeAssay: CellPart.None,
      mode: Mode.Normal,
      substanceLevels: {
        [CellPart.Cytoplasm]: {
          substance1: 20,
          substance2: 50,
          substance3: 30
        },
        [CellPart.Nucleus]: {
          substance1: 90,
          substance2: 15,
          substance3: 0
        },
        [CellPart.Golgi]: {
          substance1: 20,
          substance2: 50,
          substance3: 30
        },
        [CellPart.Intercell]: {
          substance1: 0,
          substance2: 0,
          substance3: 70
        },
        [CellPart.Gates]: {
          substance1: 30,
          substance2: 50,
          substance3: 70
        },
        [CellPart.None]: {
          substance1: 0,
          substance2: 0,
          substance3: 0,
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

  setActiveAssay(activeAssay: CellPart) {
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
    newSubstances.cytoplasm.substance3 = 60;
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
      newSubstances.cytoplasm.substance3 = 30;
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
    } else {
      this.setState({mode: Mode.Assay});
    }
  }

  handleAssayClear() {
    this.setState({ activeAssay: CellPart.None });
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
              substances={this.state.substanceLevels} 
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
