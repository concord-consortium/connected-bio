import * as React from 'react';
import { observer } from 'mobx-react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { IOrganism, createMouse } from './models/Organism';
import { rootStore, Mode } from './stores/RootStore';
import { appStore, View } from './stores/AppStore';
import { stringToEnum } from './utils';
import { ProteinWrapper } from 'protein-viewer';
import { PopulationsModelPanel } from 'cb-populations';

import OrganelleWrapper from './components/OrganelleWrapper';
import AssayTool from './components/Assay/AssayTool';
import SubstanceManipulator from './components/SubstanceManipulator/SubstanceManipulator';

interface AppProps { }

const STEP_MS = 100;

@observer
class App extends React.Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
    this.handleAssayToggle = this.handleAssayToggle.bind(this);
    this.handleAssayClear = this.handleAssayClear.bind(this);
    this.forceDropper = this.forceDropper.bind(this);
  }

  componentDidMount() {
    rootStore.startTimer(rootStore.step.bind(this, STEP_MS), STEP_MS, true);
  }

  handleViewChange(event: any) {
    let view: View = stringToEnum(event.target.value, View);
    appStore.setBoxView(event.target.name, view);
    rootStore.checkAssays();
  }

  handleOrgChange(event: any) {
    appStore.setBoxOrg(event.target.name, event.target.value);
    rootStore.checkAssays();
  }

  handleAssayToggle() {
    if (rootStore.mode === Mode.Assay) {
      rootStore.setMode(Mode.Normal);
    } else {
      rootStore.setMode(Mode.Assay);
    }
  }

  handleAssayClear() {
    rootStore.clearAssays();
  }

  handleMark(marks: any) {
    rootStore.setMarks(marks);
  }

  handleMouseAdded(mouse: any) {
    rootStore.storeOrganism(createMouse(
      `Mouse ${rootStore.storedOrganisms.length + 1}`,
      mouse.alleles.color
    ));
  }

  getBoxView(boxId: string) {
    const org: IOrganism = appStore.getBoxOrganism(boxId);
    const view: View = appStore.getBoxView(boxId);

    if (view === View.Population) {
      return <PopulationsModelPanel />;
    } else if (view === View.Builder) {
      const protein = org.genotype === 'a:b,b:b' ? 'broken' : 'working'; 
      return <ProteinWrapper display={protein} onMark={this.handleMark} />;
    } else if (view === View.Organism) {
      let imgSrc = org.getImageSrc();
      return <img src={imgSrc} width="500px" />;
    } else {
      return (
        <OrganelleWrapper
          key={view + org.id}        // unmount and remount OrganelleWrapper when `view` changes
          elementName={boxId + '-model'}
          boxId={boxId}
        />
      );
    }
  }

  forceDropper(e: any) {
    // Hack to force Fabric canvases to inherit cursor styles, should configure in Organelle instead
    if (typeof e.target.className === 'string' && e.target.className.indexOf('upper-canvas') > -1) {
      e.target.style.cursor = 'inherit';
    }
  }

  getBackpack() {
    return (
      <div className="backpack">
        Stored amino acids: {rootStore.marks.join(', ')}
        <br/>
        Stored mice:<br/>{rootStore.storedOrganisms.map((mouse, i) => `${mouse.name}: ${mouse.genotype}`).join('\n')}
      </div>
    );
  }

  getDropdowns(boxId: string) {
    const mice = rootStore.storedOrganisms;
    return (
      <div className="view-selection-container">
        <select name={boxId} value={appStore.getBoxOrganism(boxId).id} onChange={this.handleOrgChange}>
          {appStore.availableOrgs.concat(mice)
            .map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
        </select>
        <select name={boxId} value={appStore.getBoxView(boxId)} onChange={this.handleViewChange}>
          {appStore.availableViews.map(view => <option key={view} value={view}>{view}</option>)}
        </select>
      </div>
    );
  }

  getPopulationView(boxId: string) {
    const selectedOrg: IOrganism = appStore.getBoxOrganism(boxId);
    const genotype = selectedOrg.genotype;
    let envColor = 'neutral';
    let percentBB = 0;
    let percentBb = 100;
    let showSwitch = 'true';
    if (genotype === 'a:b,b:b') {
      envColor = 'white';
      percentBB = 0;
      percentBb = 0;
      showSwitch = 'false';
    } else if (genotype === 'a:B,b:B') {
      envColor = 'brown';
      percentBB = 100;
      percentBb = 0;
      showSwitch = 'false';
    }
    return (
      <div className="population-box">
        {this.getBackpack()}
        <div className="labeled-env">
          {this.getDropdowns(boxId)}
          <PopulationsModelPanel 
            modelConfig={{envs: [envColor], addToBackpack: this.handleMouseAdded, 
              percentBB, percentBb, switch: showSwitch}} 
          />
        </div>
      </div>
    );
  }

  getFourUpView() {
    const substanceTools = appStore.showSubstances ? (
      <div className="tools">
        <AssayTool
          onAssayToggle={this.handleAssayToggle}
          onAssayClear={this.handleAssayClear}
        />
        <SubstanceManipulator />
      </div>
    ) : null;
    return (
      <div className="four-up">
        {this.getBackpack()}
        <div>
          <div className="view-box" id="top-left">
            {this.getDropdowns('box-1')}
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
          <div className="view-box" id="bottom-left">
            {this.getDropdowns('box-2')}
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
        {substanceTools}
      </div>
    );
  }

  render() {
    let view = this.getFourUpView();

    if (appStore.getBoxView('box-1') === View.Population) {
      view = this.getPopulationView('box-1');
    } else if (appStore.getBoxView('box-2') === View.Population) {
      view = this.getPopulationView('box-2');
    }
    
    return (
      <MuiThemeProvider>
        <div className="cb-app">
          {view}      
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
