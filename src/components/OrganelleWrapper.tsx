import * as React from 'react';
import { autorun, reaction, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { View } from '../stores/AppStore';
import { IOrganism, OrganelleRef } from '../models/Organism';
import { OrganelleType } from '../models/Organelle';
import { rootStore, Mode } from '../stores/RootStore';
import { createModel } from 'organelle';
import * as CellModels from '../cell-models/index';
import { SubstanceType } from '../models/Substance';
import './OrganelleWrapper.css';

interface OrganelleWrapperProps {
  name: string;
  currentView: View;
  organism: IOrganism;
}

interface OrganelleWrapperState {
  hoveredOrganelle: any;
}

@observer
class OrganelleWrapper extends React.Component<OrganelleWrapperProps, OrganelleWrapperState> {
    disposers: IReactionDisposer[] = [];
    model: any;
    organelleSelectorInfo: any = {
      [OrganelleType.Nucleus]: {
        selector: '#nucleus',
        visibleModes: [Mode.Normal]
      },
      [OrganelleType.Cytoplasm]: {
        selector: `#cytoplasm`,
        opaqueSelector: '#cellshape_0_Layer0_0_FILL, #intercell_zoom_bounds'
      },
      [OrganelleType.Golgi]: {
        selector: '#golgi_x5F_apparatus',
        visibleModes: [Mode.Normal]
      },
      [OrganelleType.Extracellular]: {
        selector: `#intercell`,
        opaqueSelector: '#Layer6_0_FILL'
      },
      [OrganelleType.Melanosomes]: {
        selector: '#melanosome_2, #melanosome_4'
      },
      [OrganelleType.Receptor]: {
        selector: '#receptor-broken, #receptor-working, #receptor-bound',
        visibleModes: [Mode.Normal]
      },
      [OrganelleType.Gate]: {
        selector: '.gate-a, .gate-b, .gate-c, .gate-d',
        visibleModes: [Mode.Normal]
      },
      [OrganelleType.NearbyCells]: {
        selector: '#other_cells',
        opaqueSelector: '#backcell_x5F_color',
        visibleModes: [Mode.Normal]
      }
    };
    modelDefs: any = {
      Cell: CellModels.cell,
      Receptor: CellModels.receptor
    };

  constructor(props: OrganelleWrapperProps) {
    super(props);
    this.state = {
      hoveredOrganelle: null
    };
    this.model = null;
    this.completeLoad = this.completeLoad.bind(this);
    this.resetHoveredOrganelle = this.resetHoveredOrganelle.bind(this);
  }

  componentDidMount() {
    const {modelProperties} = this.props.organism;
    const {currentView} = this.props;
    let modelDef = this.modelDefs[currentView];

    modelDef.container = {
      elId: this.props.name,
      width: 500,
      height: 312
    };

    modelDef.properties = modelProperties.toJS();

    createModel(modelDef).then((m: any) => {
      this.model = m;
      this.completeLoad();
    });

    // Update model properties as they change
    this.disposers.push(autorun(() => {
      const newModelProperties = this.props.organism.modelProperties;
      if (this.model) {
        newModelProperties.keys().forEach((key) => {
          this.model.world.setProperty(key, newModelProperties.get(key));
        });
      }
    }));

    // Clear and update opacity whenever the mode changes
    this.disposers.push(reaction(
      () => rootStore.mode,
      () => this.setState({hoveredOrganelle: null}, () => this.updateCellOpacity())
    ));
  }

  componentWillUnmount() {
    this.disposers.forEach(disposer => disposer());
    this.model.destroy();
    delete this.model;
  }

  completeLoad() {
    this.model.on('view.loaded', () => {
      this.updateReceptorImage();
    });

    this.model.setTimeout(
      () => {
        for (var i = 0; i < 3; i++) {
          this.model.world.createAgent(this.model.world.species.gProtein);
        }
      },
      1300);

    this.model.on('hexagon.notify', () => this.updateReceptorImage());

    this.model.on('gProtein.notify.break_time', (evt: any) => {
      let proteinToBreak = evt.agent;
      let location = {x: proteinToBreak.getProperty('x'), y: proteinToBreak.getProperty('y')};
      var body = this.model.world.createAgent(this.model.world.species.gProteinBody);
      body.setProperties(location);

      var part = this.model.world.createAgent(this.model.world.species.gProteinPart);
      part.setProperties(location);

      proteinToBreak.die();

      this.model.world.setProperty('g_protein_bound', false);

      this.model.world.createAgent(this.model.world.species.gProtein);
    });

    this.model.on('model.step', () => {
      let percentLightness = this.props.organism.lightness;

      if (percentLightness <= 0.19) {
        percentLightness = 0;
      } else if (percentLightness < 0.39) {
        percentLightness = 0.2;
      } else if (percentLightness < 0.59) {
        percentLightness = 0.4;
      } else if (percentLightness < 0.79) {
        percentLightness = 0.6;
      } else if (percentLightness < 0.99) {
        percentLightness = 0.8;
      } else {
        percentLightness = 1;
      }

      // go from lightest to darkest in HSL space, which provides the best gradual transition

      // lightest brown: rgb(244, 212, 141) : hsl(41°, 82%, 75%)
      // darkest brown:  rgb(124, 81, 21)   : hsl(35°, 71%, 28%)

      let light = [41, 82, 75],
          dark = [35, 71, 28],
          color = dark.map( (c, i) => Math.round(c + (light[i] - c) * percentLightness) ),
          colorStr = `hsl(${color[0]},${color[1]}%,${color[2]}%)`;

      const cellFill = this.model.view.getModelSvgObjectById('cellshape_0_Layer0_0_FILL');
      if (cellFill) {
        cellFill.setColor(colorStr);
      }

      // set lightness on model object so it can change organism image
      this.props.organism.setCellLightness(percentLightness);
    });

    this.model.on('view.hover.enter', (evt: any) => {
      const hoveredOrganelle = this.getOrganelleFromMouseEvent(evt);
      this.setState({hoveredOrganelle}, () => this.updateCellOpacity());
    });

    this.model.on('view.click', (evt: any) => {
      const clickTarget: OrganelleType = this.getOrganelleFromMouseEvent(evt);
      if (clickTarget) {
        let location = this.model.view.transformToWorldCoordinates({x: evt.e.offsetX, y: evt.e.offsetY});
        this.organelleClick(clickTarget, location);
      }
    });
  }

  getOrganelleFromMouseEvent(evt: any) {
    let possibleTargets: OrganelleType[] = Object.keys(OrganelleType)
      .map(key => OrganelleType[key])
      .filter(organelle => this.organelleSelectorInfo[organelle])
      .filter(organelle => {
        let visibleModes = this.organelleSelectorInfo[organelle].visibleModes;
        return !visibleModes || visibleModes.indexOf(rootStore.mode) > -1;
      });
    return possibleTargets.find((t) => {
      return evt.target._organelle.matches({selector: this.organelleSelectorInfo[t].selector});
    });
  }

  resetHoveredOrganelle() {
    this.setState({hoveredOrganelle: null});
  }

  getOpaqueSelector(organelleType: string) {
    return this.organelleSelectorInfo[organelleType].opaqueSelector ?
      this.organelleSelectorInfo[organelleType].opaqueSelector :
      this.organelleSelectorInfo[organelleType].selector;
  }

  updateCellOpacity() {
    let {mode} = rootStore;
    if (mode === Mode.Assay 
        || mode === Mode.Add
        || mode === Mode.Subtract
        || (mode === Mode.Normal && this.state.hoveredOrganelle)) {
      let opaqueSelectors: string[] = [];
      if (this.state.hoveredOrganelle) {
        opaqueSelectors.push(this.getOpaqueSelector(this.state.hoveredOrganelle));
      }

      if (mode === Mode.Assay) {
        rootStore.lockedAssays.forEach((lockedAssay) => {
          if (lockedAssay.organism.id === this.props.organism.id) {
            opaqueSelectors.push(this.getOpaqueSelector(lockedAssay.organelleType));
          }
        });
        if (rootStore.activeAssay) {
          if (rootStore.activeAssay.organism === this.props.organism) {
            opaqueSelectors.push(this.getOpaqueSelector(rootStore.activeAssay.organelleType));
          }
        }
      }

      this.makeEverythingTransparentExcept({selector: opaqueSelectors.join(',')});
    } else {
      this.makeEverythingOpaque();
    }
  }

  updateReceptorImage() {
    if (this.model.world.getProperty('working_receptor')) {
      this.model.view.hide('#receptor-broken', true);
      if (this.model.world.getProperty('hormone_bound')) {
        this.model.view.hide('#receptor-working', true);
        this.model.view.show('#receptor-bound', true);
      } else {
        this.model.view.show('#receptor-working', true);
        this.model.view.hide('#receptor-bound', true);
      }
    } else {
      this.model.view.hide('#receptor-working', true);
      this.model.view.hide('#receptor-bound', true);
      this.model.view.show('#receptor-broken', true);
    }
  }

  makeEverythingTransparentExcept(skip: any) {
    if (this.model) {
      this.makeEverythingOpaque();
      this.model.view.setPropertiesOnAllObjects({opacity: '*0.7'}, true, skip, true);
    }
  }

  makeEverythingOpaque() {
    if (this.model) {
      this.model.view.resetPropertiesOnAllObjects();
    }
  }

  organelleClick(organelleType: OrganelleType, location: {x: number, y: number}) {
    if (rootStore.mode === Mode.Assay) {
      let org = rootStore.organisms.get(this.props.organism.id);
      let organelleInfo = OrganelleRef.create({
        organism: org,
        organelleType
      });
      rootStore.setActiveAssay(organelleInfo);
    } else if (rootStore.mode === Mode.Add || rootStore.mode === Mode.Subtract) {
      // update substance levels
      rootStore.changeSubstanceLevel(OrganelleRef.create({ organism: this.props.organism, organelleType }));
      // show animation in model
      let substanceType = rootStore.activeSubstance;
      if (substanceType === SubstanceType.Hormone) {
        this.addHormone(organelleType, location);
      } else if (substanceType === SubstanceType.SignalProtein) {
        this.addSignalProtein(organelleType, location);
      }
    }
  }

  addAgentsOverTime(species: string, state: string, props: object, countAtOnce: number, times: number, period: number) {
    const addAgents = () => {
      for (let i = 0; i < countAtOnce; i++) {
        const a = this.model.world.createAgent(this.model.world.species[species]);
        a.state = state;
        a.setProperties(props);
      }
    };

    let added = 0;
    const addAgentsAgent = () => {
      addAgents();
      added++;
      if (added < times) {
        this.model.setTimeout(addAgentsAgent, period);
      }
    };
    addAgentsAgent();
  }

  addHormone(organelleType: OrganelleType, location: {x: number, y: number}) {
    let inIntercell = organelleType === OrganelleType.Extracellular;
    let species = 'hexagon';
    let state = inIntercell ? 'find_path_from_anywhere' : 'diffuse';
    let props = inIntercell ? location : {speed: 0.4, x: location.x, y: location.y};
    let count = inIntercell ? 3 : 1;
    this.addAgentsOverTime(species, state, props, count, 18, 200);
  }

  addSignalProtein(organelleType: OrganelleType, location: {x: number, y: number}) {
    let inIntercell = organelleType === OrganelleType.Extracellular;
    let species = 'gProteinPart';
    let state = inIntercell ? 'find_flowing_path' : 'in_cell_from_click';
    this.addAgentsOverTime(species, state, location, 1, 9, 400);
  }

  componentDidUpdate() {
    this.updateCellOpacity();
  }

  render() {
    let hoverDiv = this.state.hoveredOrganelle
      ? (
        <div className="hover-location">
          {this.state.hoveredOrganelle}
        </div>)
      : null;
    return (
      <div className="model-wrapper">
        <div id={this.props.name} className="model" onMouseLeave={this.resetHoveredOrganelle}/>
        {hoverDiv}
      </div>
    );
  }
}

export default OrganelleWrapper;