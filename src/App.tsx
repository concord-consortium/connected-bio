import * as React from 'react';
import { observer } from 'mobx-react';
import './App.css';
import { MuiThemeProvider } from 'material-ui/styles';
import { IOrganism } from './models/Organism';
import { rootStore, Mode } from './stores/RootStore';
import { appStore, View } from './stores/AppStore';
import { stringToEnum } from './utils';

import OrganelleWrapper from './components/OrganelleWrapper';
import AssayTool from './components/Assay/AssayTool';
import SubstanceManipulator from './components/SubstanceManipulator/SubstanceManipulator';
import Genome from './components/Genetics/Genome';
import { RaisedButton } from 'material-ui';
import { Bar } from 'react-chartjs-2';

declare var BioLogica: any;

interface AppProps { }
interface AppState {
  offspring:  any[];
}

const STEP_MS = 100;

@observer
class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      offspring: []
    };
    this.handleAssayToggle = this.handleAssayToggle.bind(this);
    this.handleAssayClear = this.handleAssayClear.bind(this);
    this.forceDropper = this.forceDropper.bind(this);
    this.handleBreed = this.handleBreed.bind(this);
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

  getBoxView(boxId: string) {
    const org: IOrganism = appStore.getBoxOrganism(boxId);
    const view: View = appStore.getBoxView(boxId);

    if (view === View.None) {
      return null;
    } else if (view === View.Organism) {
      let imgSrc = org.getImageSrc();
      return <img src={imgSrc} width="500px" />;
    } else if (view === View.Genome) {
      let imgSrc = org.getImageSrc();
      return (
        <div className="organism-genome">
          <div>
            <img src={imgSrc} width="200px" />
          </div>
          <Genome
            editable={appStore.canEditGenome}
            org={org}
          />
        </div>
      );
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
    if (e.target.className.indexOf && e.target.className.indexOf('upper-canvas') > -1) {
      e.target.style.cursor = 'inherit';
    }
  }

  handleBreed() {
    const bioOrg1 = appStore.getBoxOrganism('box-1').getBiologicaOrganism();
    const bioOrg2 = appStore.getBoxOrganism('box-2').getBiologicaOrganism();
    const offspring = new Array(20).fill(null).map(() => BioLogica.breed(bioOrg1, bioOrg2)) as any[];
    this.setState({offspring});
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
    const offspringViews = this.state.offspring.map((org, i: number) => {
      const color = org.getCharacteristic('color');
      const imgSrc = color === 'Light' ? 'assets/sandrat-10.png' : 'assets/sandrat-02.png';
      return <img key={`offspring-${i}`} src={imgSrc} width="102px" />;
    });
    const numDark = this.state.offspring.filter(o => o.phenotype.characteristics.color === 'Dark').length;
    const numLight = this.state.offspring.filter(o => o.phenotype.characteristics.color === 'Light').length;
    const data = {
      labels: ['Brown', 'White'],
      datasets: [
        {
          label: 'Offspring',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: [numDark, numLight]
        }
      ]
    };
    const breedingTools = (
      <div>
        <div className="box offspring-container">
          {offspringViews}
          <div className="offspring-chart">
            <Bar
              data={data}
              options={{
                maintainAspectRatio: true,
                scales: {
                  yAxes: [{
                      ticks: {
                        min: 0,
                        max: 20
                      }
                    }]
                  }
              }}
            />
          </div>
        </div>
        <div className="box breed-tools">
          <RaisedButton
            label={'Breed'}
            onClick={this.handleBreed}
            style={{width: '150px', margin: '5px'}}
            labelStyle={{ fontSize: '11px'}}
            primary={true}
          />
        </div>
      </div>
    );
    const showingTwoDiffGenomeViews = appStore.getBoxView('box-1') === View.Genome &&
      appStore.getBoxView('box-2') === View.Genome &&
      appStore.getBoxOrganism('box-1').id !== appStore.getBoxOrganism('box-2').id;
    const rightPanel = showingTwoDiffGenomeViews ? breedingTools : substanceTools;
    return (
      <MuiThemeProvider>
        <div className="App">
          <div className="four-up">
            <div>
              <div className="view-box" id="top-left">
                <div className="view-selection-container">
                  <select name="box-1" value={appStore.getBoxOrganism('box-1').id} onChange={this.handleOrgChange}>
                    {rootStore.availableOrgs.map(org => <option key={org.id} value={org.id}>{org.id}</option>)}
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
                    {rootStore.availableOrgs.map(org => <option key={org.id} value={org.id}>{org.id}</option>)}
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
            {rightPanel}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
