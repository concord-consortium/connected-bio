import * as React from 'react';
import './App.css';

import OrganelleWrapper from './components/organelle-wrapper';
import Chart from './components/chart';

interface App {}

class App extends React.Component<any, any> {

  constructor(props: App) {
    super(props);
    this.state = {
      addHormone: false,
      box1: "cell",
      box2: "organism",
      modelProperties: {
        albino: true,
        working_tyr1: false,
        working_myosin_5a: false,
        open_gates: false
      },
      addEnzyme: false,
      activeAssay: "nucleus",
      substanceLevels: {
        cytoplasm: {
          substance1: 20,
          substance2: 50,
          substance3: 30
        },
        nucleus: {
          substance4: 40,
          substance5: 15
        }
      }
    };
    this.setActiveAssay = this.setActiveAssay.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleHormoneClick = this.handleHormoneClick.bind(this);
    this.handleEnzymeClick = this.handleEnzymeClick.bind(this);
  }

  setActiveAssay(activeAssay:string) {
    this.setState({ activeAssay })
  }

  handleViewChange(event:any) {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleHormoneClick() {
    this.setState({addHormone: true});
    setTimeout(() => this.setState({addHormone: false}), 500);
  }

  handleEnzymeClick() {
    let newSubstances = Object.assign({}, this.state.substanceLevels)
    newSubstances.cytoplasm.substance3 = 60
    this.setState({
      addEnzyme: true,
      modelProperties: {
        albino: true,
        working_tyr1: true,
        working_myosin_5a: false,
        open_gates: false
      },
      substanceLevels: newSubstances
    });
    setTimeout(() => {
      let newSubstances = Object.assign({}, this.state.substanceLevels)
      newSubstances.cytoplasm.substance3 = 30
      this.setState({
        addEnzyme: false,
        modelProperties: {
          albino: true,
          working_tyr1: false,
          working_myosin_5a: false,
          open_gates: false
        },
        substanceLevels: newSubstances
      })
    }, 4000);
  }

  getBoxView(boxId:any) {
    const opt = this.state[boxId];
    const viewBoxes = {
      cell: "0 0 1280 800",
      membrane: "500 100 320 200",
      golgi: "350 450 320 200"
    };

    if (opt === "none") {
      return null;
    } else if (opt === "organism") {
      let imgSrc = "assets/sandrat-light.png";
      if (this.state.addEnzyme) {
        imgSrc = "assets/sandrat-dark.png";
      }
      return <img src={imgSrc} width="500px" />
    } else {
      return (
        <OrganelleWrapper 
          name={boxId + "-model"}
          viewBox={viewBoxes[opt]}
          modelProperties={this.state.modelProperties} 
          doAddHormone={this.state.addHormone}
          addEnzyme={this.state.addEnzyme}
          setActiveAssay={this.setActiveAssay}
          currentView={opt}
        />
      );
    }
  }

  render() {
    return (
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
                { this.getBoxView("box1") }
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
                { this.getBoxView("box2") }
              </div>
            </div>
          </div>
          <div className="buttons">
            <button onClick={this.handleHormoneClick}>Add hormone</button>
            <button onClick={this.handleEnzymeClick}>Add enzyme</button>
          </div>
          <Chart substances={this.state.substanceLevels} activeAssay={this.state.activeAssay} />
        </div>
      </div>
    );
  }
}

export default App;
