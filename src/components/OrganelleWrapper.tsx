import * as React from 'react';
import { autorun, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { IOrganism, OrganelleRef } from '../models/Organism';
import { OrganelleType } from '../models/Organelle';
import { View, appStore } from '../stores/AppStore';
import { rootStore, Mode } from '../stores/RootStore';
import { createModel } from 'organelle';
import * as CellModels from '../cell-models/index';
import { SubstanceType } from '../models/Substance';
import './OrganelleWrapper.css';

interface OrganelleWrapperProps {
  elementName: string;
  boxId: string;
}

interface OrganelleWrapperState {
  hoveredOrganelle: any;
  dropperCoords: any;
}

const SUBSTANCE_ADDITION_MS = 3500;

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
      Protein: CellModels.receptor
    };

  constructor(props: OrganelleWrapperProps) {
    super(props);
    this.state = {
      hoveredOrganelle: null,
      dropperCoords: []
    };
    this.completeLoad = this.completeLoad.bind(this);
    this.resetHoveredOrganelle = this.resetHoveredOrganelle.bind(this);
  }

  componentDidMount() {
    const box = appStore.boxes.get(this.props.boxId);
    const view = box.viewType;
    const {organism} = box;
    const {modelProperties} = organism;
    let modelDef = this.modelDefs[view];

    modelDef.container = {
      elId: this.props.elementName,
      width: 500,
      height: 312
    };

    modelDef.properties = modelProperties.toJS();

    createModel(modelDef).then((m: any) => {
      appStore.boxes.get(this.props.boxId).setModel(m);
      this.completeLoad();
    });
    
    // Update model properties as they change
    this.disposers.push(autorun(() => {
      const newModelProperties = organism.modelProperties;
      if (this.getModel()) {
        newModelProperties.keys().forEach((key) => {
          this.getModel().world.setProperty(key, newModelProperties.get(key));
        });
      }
    }));
  }

  componentWillUnmount() {
    this.disposers.forEach(disposer => disposer());
    this.getModel().destroy();
    appStore.boxes.get(this.props.boxId).setModel(null);
  }

  getModel() {
    return appStore.boxes.get(this.props.boxId).model;
  }

  completeLoad() {
    const model = this.getModel();
    model.on('view.loaded', () => {
      this.updateReceptorImage();
    });

    model.setTimeout(
      () => {
        for (var i = 0; i < 3; i++) {
          model.world.createAgent(model.world.species.gProtein);
        }
      },
      1300);

    model.on('hexagon.notify', () => this.updateReceptorImage());

    model.on('gProtein.notify.break_time', (evt: any) => {
      let proteinToBreak = evt.agent;
      let location = {x: proteinToBreak.getProperty('x'), y: proteinToBreak.getProperty('y')};
      var body = model.world.createAgent(model.world.species.gProteinBody);
      body.setProperties(location);

      var part = model.world.createAgent(model.world.species.gProteinPart);
      part.setProperties(location);

      proteinToBreak.die();

      model.world.setProperty('g_protein_bound', false);

      model.world.createAgent(model.world.species.gProtein);
    });

    model.on('model.step', () => {
      let organism: IOrganism = appStore.getBoxOrganism(this.props.boxId);
      let percentLightness = organism.lightness;

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

      const cellFill = model.view.getModelSvgObjectById('cellshape_0_Layer0_0_FILL');
      if (cellFill) {
        cellFill.setColor(colorStr);
      }

      // set lightness on model object so it can change organism image
      organism.setCellLightness(percentLightness);
    });

    model.on('view.hover.enter', (evt: any) => {
      const hoveredOrganelle = this.getOrganelleFromMouseEvent(evt);
      this.setState({hoveredOrganelle});
    });

    model.on('view.click', (evt: any) => {
      const clickTarget: OrganelleType = this.getOrganelleFromMouseEvent(evt);
      if (clickTarget) {
        // Keep the dropper displayed for substance additions
        if (rootStore.mode === Mode.Add || rootStore.mode === Mode.Subtract) {
          const newCoords = this.state.dropperCoords.slice(0);
          newCoords.push({x: evt.e.layerX, y: evt.e.layerY});
          this.setState({dropperCoords: newCoords});
          rootStore.startTimer(() => {
            const splicedCoords = this.state.dropperCoords.slice(0);
            splicedCoords.splice(0, 1);
            this.setState({dropperCoords: splicedCoords});
          },                   SUBSTANCE_ADDITION_MS);
        }

        // Handle the click in the Organelle model
        let location = model.view.transformToWorldCoordinates({x: evt.e.offsetX, y: evt.e.offsetY});
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

  updateReceptorImage() {
    const model = this.getModel();
    if (model.world.getProperty('working_receptor')) {
      model.view.hide('#receptor-broken', true);
      if (model.world.getProperty('hormone_bound')) {
        model.view.hide('#receptor-working', true);
        model.view.show('#receptor-bound', true);
      } else {
        model.view.show('#receptor-working', true);
        model.view.hide('#receptor-bound', true);
      }
    } else {
      model.view.hide('#receptor-working', true);
      model.view.hide('#receptor-bound', true);
      model.view.show('#receptor-broken', true);
    }
  }

  organelleClick(organelleType: OrganelleType, location: {x: number, y: number}) {
    let organism = appStore.getBoxOrganism(this.props.boxId);
    if (rootStore.mode === Mode.Assay) {
      let organelleInfo = OrganelleRef.create({
        organism,
        organelleType
      });
      rootStore.setActiveAssay(organelleInfo);
    } else if (rootStore.mode === Mode.Add || rootStore.mode === Mode.Subtract) {
      // update substance levels
      rootStore.changeSubstanceLevel(OrganelleRef.create({ organism: organism, organelleType }));
      // show animation in model
      let substanceType = rootStore.activeSubstance;
      if (substanceType === SubstanceType.Hormone) {
        this.addHormone(organelleType, location);
      } else if (substanceType === SubstanceType.SignalProtein) {
        this.addSignalProtein(organelleType, location);
      }
    }
  }

  addAgentsOverTime(species: string, state: string, props: object, countAtOnce: number, times: number) {
    let period = SUBSTANCE_ADDITION_MS / times;
    const addAgents = (model: any) => {
      for (let i = 0; i < countAtOnce; i++) {
        const a = model.world.createAgent(this.getModel().world.species[species]);
        a.state = state;
        a.setProperties(props);
      }
    };

    const addAgentsAgent = (model: any, added: number) => {
      addAgents(model);
      if (added < times) {
        model.setTimeout(addAgentsAgent.bind(this, model, added + 1), period);
      }
    };

    let matchingBoxes = Object.keys(appStore.boxes.toJS())
      .map((key) => appStore.boxes.get(key))
      .filter((otherBox: any) => {
        return (
          otherBox.organism.id === appStore.getBoxOrganism(this.props.boxId).id &&
          (otherBox.viewType === View.Cell || otherBox.viewType === View.Protein)
        );
    });

    matchingBoxes.forEach((box) => addAgentsAgent(box.model, 0));
  }

  addHormone(organelleType: OrganelleType, location: {x: number, y: number}) {
    let inIntercell = organelleType === OrganelleType.Extracellular;
    let species = 'hexagon';
    let state = inIntercell ? 'find_path_from_anywhere' : 'diffuse';
    let props = inIntercell ? location : {speed: 0.4, x: location.x, y: location.y};
    let count = inIntercell ? 3 : 2;
    this.addAgentsOverTime(species, state, props, count, 9);
  }

  addSignalProtein(organelleType: OrganelleType, location: {x: number, y: number}) {
    let inIntercell = organelleType === OrganelleType.Extracellular;
    let species = 'gProteinPart';
    let state = inIntercell ? 'find_flowing_path' : 'in_cell_from_click';
    this.addAgentsOverTime(species, state, location, 1, 9);
  }

  isModeDropper(mode: string) {
    return mode === Mode.Assay || mode === Mode.Add || mode === Mode.Subtract;
  }

  render() {
    const hoverDiv = this.state.hoveredOrganelle
      ? (
        <div className="hover-location">
          {this.state.hoveredOrganelle}
        </div>)
      : null;

    const droppers: any = this.state.dropperCoords.map((dropperCoord: any, i: number) => (
      <div className="temp-dropper" key={i} style={{left: dropperCoord.x - 6, top: dropperCoord.y - 28}}>
        <img src="assets/dropper.png" width="32px"/>
      </div>
    ));
    const dropperCursor = this.state.hoveredOrganelle && this.isModeDropper(rootStore.mode);
    return (
      <div className={'model-wrapper' + (dropperCursor ? ' dropper' : '')}>
        <div id={this.props.elementName} className="model" onMouseLeave={this.resetHoveredOrganelle}/>
        {hoverDiv}
        {droppers}
      </div>
    );
  }
}

export default OrganelleWrapper;