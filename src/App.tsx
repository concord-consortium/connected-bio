import * as React from 'react';
import { observer } from 'mobx-react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { IOrganism } from './models/Organism';
import { rootStore, Mode } from './stores/RootStore';
import { appStore, View } from './stores/AppStore';
import { stringToEnum } from './utils';
import { ProteinWrapper } from 'protein-viewer';

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
    appStore.setBoxOrg(event.target.name, rootStore.organisms.get(event.target.value));
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
    console.log(marks);
  }

  getBoxView(boxId: string) {
    const org: IOrganism = appStore.getBoxOrganism(boxId);
    const view: View = appStore.getBoxView(boxId);

    if (view === View.None) {
      return <ProteinWrapper display="working" onMark={this.handleMark} />;
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

  render() {
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
      <MuiThemeProvider>
        <div className="App">
          <div className="four-up">
            <div>
              <div className="view-box" id="top-left">
                <div className="view-selection-container">
                  <select name="box-1" value={appStore.getBoxOrganism('box-1').id} onChange={this.handleOrgChange}>
                    {appStore.availableOrgs.map(org => <option key={org.id} value={org.id}>{org.id}</option>)}
                  </select>
                  <select name="box-1" value={appStore.getBoxView('box-1')} onChange={this.handleViewChange}>
                    {appStore.availableViews.map(view => <option key={view} value={view}>{view}</option>)}
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
              <div className="view-box" id="bottom-left">
                <div className="view-selection-container">
                  <select name="box-2" value={appStore.getBoxOrganism('box-2').id} onChange={this.handleOrgChange}>
                    {appStore.availableOrgs.map(org => <option key={org.id} value={org.id}>{org.id}</option>)}
                  </select>
                  <select name="box-2" value={appStore.getBoxView('box-2')} onChange={this.handleViewChange}>
                    {appStore.availableViews.map(view => <option key={view} value={view}>{view}</option>)}
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
            {substanceTools}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
