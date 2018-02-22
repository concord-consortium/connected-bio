import * as React from 'react';
import { observer } from 'mobx-react';
import { clone } from 'mobx-state-tree';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { IOrganism, IOrganelleRef } from './models/Organism';
import { isEqual } from 'lodash';
import { rootStore, Mode } from './stores/RootStore';
import { appStore, View } from './stores/AppStore';
import { stringToEnum } from './utils';

import OrganelleWrapper from './components/organelle-wrapper';
import AssayTool from './components/Assay/AssayTool';
import SubstanceManipulator from './components/SubstanceManipulator/SubstanceManipulator';

interface AppState {
  addHormone: boolean;
  addEnzyme: boolean;
}

interface AppProps { }

const STEP_MS = 100;

@observer
class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      addHormone: false,
      addEnzyme: false
    };
    this.handleAssayToggle = this.handleAssayToggle.bind(this);
    this.handleAssayClear = this.handleAssayClear.bind(this);
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

  handleViewChange(event: any) {
    let view: View = stringToEnum(event.target.value, View);
    appStore.setBoxView(event.target.name, view);
  }

  handleOrgChange(event: any) {
    appStore.setBoxOrg(event.target.name, rootStore.organisms.get(event.target.value));
  }

  handleAssayToggle() {
    if (rootStore.mode === Mode.Assay) {
      rootStore.setMode(Mode.Normal);
      // Lock an assay after it is finished, if one exists
      let { activeAssay } = rootStore;
      if (activeAssay) {
        let repeatAssay = rootStore.lockedAssays
          .reduce((accumulator: boolean, assay: IOrganelleRef) => {
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

  getBoxView(boxId: string) {
    const org: IOrganism = rootStore.organisms.get(appStore.getBoxOrgName(boxId));
    const view: View = appStore.getBoxView(boxId);

    if (view === View.None) {
      return null;
    } else if (view === View.Organism) {
      let imgSrc = org.getImageSrc();
      return <img src={imgSrc} width="500px" />;
    } else {
      return (
        <OrganelleWrapper 
          name={boxId + '-model'}
          doAddHormone={this.state.addHormone}
          addEnzyme={this.state.addEnzyme}
          currentView={view}
          organism={org}
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
                  <select name="box-1" value={appStore.getBoxOrgName('box-1')} onChange={this.handleOrgChange}>
                    <option value="Beach Mouse">Beach Mouse</option>
                    <option value="Field Mouse">Field Mouse</option>
                  </select>
                  <select name="box-1" value={appStore.getBoxView('box-1')} onChange={this.handleViewChange}>
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
                  {this.getBoxView('box-1')}
                </div>
              </div>
              <div>
                <div>
                  <select name="box-2" value={appStore.getBoxOrgName('box-2')} onChange={this.handleOrgChange}>
                    <option value="Beach Mouse">Beach Mouse</option>
                    <option value="Field Mouse">Field Mouse</option>
                  </select>
                  <select name="box-2" value={appStore.getBoxView('box-2')} onChange={this.handleViewChange}>
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
                  {this.getBoxView('box-2')}
                </div>
              </div>
            </div>
            <div className="tools">
              <AssayTool 
                onAssayToggle={this.handleAssayToggle}
                onAssayClear={this.handleAssayClear}
              />
              <SubstanceManipulator />
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
