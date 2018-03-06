import * as React from 'react';
import { autorun, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import { View } from '../stores/AppStore';
import { IOrganism, OrganelleRef } from '../models/Organism';
import { OrganelleType } from '../models/Organelle';
import { rootStore, Mode } from '../stores/RootStore';
import { createModel } from 'organelle';
import * as CellModels from '../cell-models/index';
import { SubstanceType, ISubstance } from '../models/Substance';
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
    handler: IReactionDisposer;
    model: any;
    clickTargets = [
      OrganelleType.Cytoplasm,
      OrganelleType.Nucleus,
      OrganelleType.Golgi,
      OrganelleType.Extracellular,
      OrganelleType.Melanosome
    ];
    organelleSelectorInfo: any = {
      [OrganelleType.Nucleus]: {
        selector: '#nucleus'
      },
      [OrganelleType.Cytoplasm]: {
        selector: '#cytoplasm, #intercell_zoom_bounds, #microtubules_x5F_grouped',
        opaqueSelector: '#cellshape_0_Layer0_0_FILL, #intercell_zoom_bounds'
      },
      [OrganelleType.Golgi]: {
        selector: '#golgi_x5F_apparatus'
      },
      [OrganelleType.Extracellular]: {
        selector: `#intercell, .gate-a, .gate-b, .gate-c, .gate-d`,
        opaqueSelector: '#Layer6_0_FILL'
      },
      [OrganelleType.Melanosome]: {
        selector: '#melanosome_2, #melanosome_4'
      }
    };
    modelDefs: any = {
      CELL: CellModels.cell,
      RECEPTOR: CellModels.receptor
    };

  constructor(props: OrganelleWrapperProps) {
    super(props);
    this.state = {
      hoveredOrganelle: null
    };
    this.model = null;
    this.completeLoad = this.completeLoad.bind(this);
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

    modelDef.properties = modelProperties;

    createModel(modelDef).then((m: any) => {
      this.model = m;
      this.completeLoad();
    });

    this.handler = autorun(() => {
      if (this.model) {
        const newModelProperties = this.props.organism.modelProperties;
        // update model properties from Organism model every step
        Object.keys(newModelProperties).forEach((key) => {
          this.model.world.setProperty(key, newModelProperties[key]);
        });
      }

      if (rootStore.mode === Mode.Normal) {
        this.setState({hoveredOrganelle: null}, () => this.updateCellOpacity());
      }
    });
  }

  componentWillUnmount() {
    this.handler();
    this.model.destroy();
    delete this.model;
  }

  completeLoad() {
    if (this.props.currentView === 'RECEPTOR') {
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
    }

    this.model.on('model.step', () => {
      let lightness = this.model.world.getProperty('lightness'),    // ratio light to dark mels,   e.g. 0.5,  1,   3
          percentLightness = lightness / (lightness + 1);           // percent light mels of total e.g. 0.33, 0.5, 0.75

      if (isNaN(percentLightness)) {
        // model has no dark melanosomes, calculated prop `lightness` is NaN (div-zero)
        percentLightness = 1;
      }

      // round to nearest 0.2, making 5 different colors
      percentLightness = Math.round(percentLightness * 5) / 5;

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
      if (rootStore.mode === Mode.Normal) {
        return;
      }

      const hoveredOrganelle = Object.keys(this.organelleSelectorInfo)
        .reduce((accumulator, organelle) => {
          let selector = this.organelleSelectorInfo[organelle].selector;
          let matches = evt.target._organelle.matches({selector});
          if (matches) {
            return organelle;
          } else {
            return accumulator;
          }
        },      null);

      this.setState({hoveredOrganelle}, () => this.updateCellOpacity());
    });

    this.model.on('view.hover.exit', (evt: any) => {
      if (rootStore.mode !== Mode.Assay) {
        return;
      }

      this.setState({hoveredOrganelle: null});
    });

    this.model.on('view.click', (evt: any) => {
      console.log(evt.target);
      let clickTarget: OrganelleType = this.clickTargets.find((t) => {
        return evt.target._organelle.matches({selector: this.organelleSelectorInfo[t].selector});
      });
      if (clickTarget) {
        let location = this.model.view.transformToWorldCoordinates({x: evt.e.offsetX, y: evt.e.offsetY});
        this.organelleClick(clickTarget, location);
      }
    });
  }

  getOpaqueSelector(organelleType: string) {
    return this.organelleSelectorInfo[organelleType].opaqueSelector ?
      this.organelleSelectorInfo[organelleType].opaqueSelector :
      this.organelleSelectorInfo[organelleType].selector;
  }

  updateCellOpacity() {
    let {mode} = rootStore;
    if (mode === Mode.Assay || mode === Mode.Add || mode === Mode.Subtract) {
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
      this.model.view.hide('#receptor_x5F_protein_broken', true);
      if (this.model.world.getProperty('hormone_bound')) {
        this.model.view.hide('#receptor_x5F_protein', true);
        this.model.view.show('#receptor_x5F_protein_bound', true);
      } else {
        this.model.view.show('#receptor_x5F_protein', true);
        this.model.view.hide('#receptor_x5F_protein_bound', true);
      }
    } else {
      this.model.view.hide('#receptor_x5F_protein', true);
      this.model.view.hide('#receptor_x5F_protein_bound', true);
      this.model.view.show('#receptor_x5F_protein_broken', true);
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
      let {substanceType} = rootStore.activeSubstanceManipulation as ISubstance;
      if (substanceType === SubstanceType.Hormone) {
        this.addHormone(organelleType, location);
      } else if (substanceType === SubstanceType.GProtein && this.props.currentView === View.Receptor) {
        this.addGProtein(organelleType, location);
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
    let inZoom = this.props.currentView === View.Receptor;
    let inIntercell = organelleType === OrganelleType.Extracellular;
    let species = inZoom ? 'hexagon' : 'hormoneDot';
    let state = inIntercell ? 'find_path_from_anywhere' : 'diffuse';
    let props = inIntercell ? location : {speed: 0.4, x: location.x, y: location.y};
    let count = inIntercell ? 3 : 2;
    this.addAgentsOverTime(species, state, props, count, 7, 350);
  }

  addGProtein(organelleType: OrganelleType, location: {x: number, y: number}) {
    let inIntercell = organelleType === OrganelleType.Extracellular;
    let species = 'gProteinPart';
    let state = inIntercell ? 'find_flowing_path' : 'in_cell_from_click';
    this.addAgentsOverTime(species, state, location, 1, 7, 350);
  }

  componentDidUpdate() {
    this.updateCellOpacity();
  }

  render() {
    let showHoverLocation = rootStore.mode !== Mode.Normal,
        hoverLocation = this.state.hoveredOrganelle ? this.state.hoveredOrganelle : '',
        hoverDiv = showHoverLocation ?
      (
        <div className="hover-location">
          {hoverLocation}
        </div>
      ) : null;
    return (
      <div className="model-wrapper">
        <div id={this.props.name} className="model" />
        {hoverDiv}
      </div>
    );
  }
}

export default OrganelleWrapper;