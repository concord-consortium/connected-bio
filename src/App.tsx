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
      box1Size: 1,
      box2Size: 1,
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
    this.handleBox1SizeChange = this.handleBox1SizeChange.bind(this);
    this.handleBox2SizeChange = this.handleBox2SizeChange.bind(this);
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

  handleBox1SizeChange() {
    let box1Size = this.state.box1Size === 1 ? 2 : 1;
    let box2Size = box1Size === 1 ? 1 : Math.abs(box1Size - 2);
    this.setState({ box1Size, box2Size });
    this.forceUpdate();
  }

  handleBox2SizeChange() {
    let box2Size = this.state.box2Size === 1 ? 2 : 1;
    let box1Size = box2Size === 1 ? 1 : Math.abs(box2Size - 2);
    this.setState({ box1Size, box2Size });
    this.forceUpdate();
  }

  getBoxView(boxId: any, size: number) {
    const opt = this.state[boxId];
    const viewBoxes = {
      cell: '0 0 1280 800',
      membrane: '500 100 320 200',
      golgi: '350 450 320 200'
    };

    if (opt === 'none') {
      return null;
    } else if (opt === 'organism') {
      let imgSrc = 'assets/sandrat-light.png';
      if (this.state.addEnzyme) {
        imgSrc = 'assets/sandrat-dark.png';
      }
      let imageSize = size === 0 ? '128px' : size === 1 ? '500px' : '880px';
      return <img src={imgSrc} width={imageSize} />;
    } else {
      let width = size === 0 ? 128 : size === 1 ? 500 : 882;
      return (
        <OrganelleWrapper
          key={`${boxId}-${size}`}
          name={boxId + '-model'}
          viewBox={viewBoxes[opt]}
          modelProperties={this.state.modelProperties}
          doAddHormone={this.state.addHormone}
          addEnzyme={this.state.addEnzyme}
          setActiveAssay={this.setActiveAssay}
          currentView={opt}
          mode={this.state.mode}
          activeAssay={this.state.activeAssay}
          width={width}
        />
      );
    }
  }

  render() {
    let oneBoxIsLarge = this.state.box1Size === 2 || this.state.box2Size === 2;
    let sizeString = (size: number) => size === 0 ? 'small' : size === 1 ? '' : 'large';
    let buttonSizeString = (size: number) => size < 2 ? '➚' : '➘';
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Connected Bio</h1>
          </header>
          <div className="four-up">
            <div>
              <div>
                <div style={{'display': 'flex'}}>
                  <select id="box1" value={this.state.box1} onChange={this.handleViewChange}>
                    <option value="none">None</option>
                    <option value="organism">Organism</option>
                    <option value="cell">Cell</option>
                  </select>
                  <button onClick={this.handleBox1SizeChange}>{buttonSizeString(this.state.box1Size)}</button>
                </div>
                <div className={`box ${sizeString(this.state.box1Size)}`}>
                  {this.getBoxView('box1', this.state.box1Size)}
                </div>
              </div>
              <div>
                <div style={{'display': 'flex'}}>
                  <select id="box2" value={this.state.box2} onChange={this.handleViewChange}>
                    <option value="none">None</option>
                    <option value="organism">Organism</option>
                    <option value="cell">Cell</option>
                  </select>
                  <button onClick={this.handleBox2SizeChange}>{buttonSizeString(this.state.box2Size)}</button>
                </div>
                <div className={`box ${sizeString(this.state.box2Size)}`}>
                  {this.getBoxView('box2', this.state.box2Size)}
                </div>
              </div>
            </div>
            <Chart
              key={`${oneBoxIsLarge}`}
              substances={this.state.substanceLevels}
              activeAssay={this.state.activeAssay}
              mode={this.state.mode}
              onAssayToggle={this.handleAssayToggle}
              onAssayClear={this.handleAssayClear}
              classNames={oneBoxIsLarge ? 'small' : ''}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
