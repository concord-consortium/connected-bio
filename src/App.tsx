import * as React from 'react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';

import OrganelleWrapper from './components/organelle-wrapper';
import Chart from './components/Chart/chart';

interface App {}

class App extends React.Component<any, any> {

  constructor(props: App) {
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
      activeAssay: 'none',
      mode: 'normal',
      substanceLevels: {
        cytoplasm: {
          substance1: 20,
          substance2: 50,
          substance3: 30
        },
        nucleus: {
          substance1: 90,
          substance2: 15,
          substance3: 0
        },
        golgi: {
          substance1: 20,
          substance2: 50,
          substance3: 30
        },
        intercell: {
          substance1: 0,
          substance2: 0,
          substance3: 70
        },
        gates: {
          substance1: 30,
          substance2: 50,
          substance3: 70
        },
        none: {
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

  setActiveAssay(activeAssay: string) {
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
    if (this.state.mode === 'assay') {
      this.setState({mode: 'normal'});
    } else {
      this.setState({mode: 'assay'});
    }
  }

  handleAssayClear() {
    this.setState({ activeAssay: 'none' });
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
