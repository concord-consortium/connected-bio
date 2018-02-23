import * as React from 'react';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { IOrganism, OrganelleRef } from '../models/Organism';
import { OrganelleType } from '../models/Organelle';
import { rootStore, Mode } from '../stores/RootStore';
import { createModel } from 'organelle';

interface OrganelleWrapperProps {
  name: string;
  doAddHormone: boolean;
  addEnzyme: boolean;
  currentView: any;
  organism: IOrganism;
}

interface OrganelleWrapperState {
  hoveredOrganelle: any;
}

@observer
class OrganelleWrapper extends React.Component<OrganelleWrapperProps, OrganelleWrapperState> {
    model: any;
    organelleSelectorInfo: any = {
      [OrganelleType.Nucleus]: {
        selector: '#nucleus'
      },
      [OrganelleType.Cytoplasm]: {
        selector: '#cytoplasm',
        opaqueSelector: '#cellshape_0_Layer0_0_FILL'
      },
      [OrganelleType.Golgi]: {
        selector: '#golgi_x5F_apparatus'
      },
      [OrganelleType.Gates]: {
        selector: '.gate-a, .gate-b, .gate-c, .gate-d'
      },
      [OrganelleType.Intercell]: {
        selector: `#intercell`,
        opaqueSelector: '#Layer6_0_FILL'
      },
      [OrganelleType.Melanosome]: {
        selector: '#melanosome_2'
      }
    };
  constructor(props: OrganelleWrapperProps) {
    super(props);
    this.state = {
      hoveredOrganelle: null
    };
    this.model = null;
    this.addHormone = this.addHormone.bind(this);
    this.completeLoad = this.completeLoad.bind(this);
  }

  componentDidMount() {
    const {modelProperties} = this.props.organism;

    createModel({
      container: {
        elId: this.props.name,
        width: 500,
        height: 312
      },
      modelSvg: 'assets/melanocyte.svg',
      properties: modelProperties,
      calculatedProperties: {
        saturation: {
          ratio: {
            numerator: {
              count: {
                species: 'melanosome',
                state: [
                  'waiting_on_actin_terminal',
                  'waiting_on_nuclear_actin_terminal'
                ],
              }
            },
            denominator: 20
          }
        },
        grayness: {
          ratio: {
            numerator: {
              count: {
                species: 'melanosome',
                state: [
                  'waiting_on_actin_terminal',
                  'waiting_on_nuclear_actin_terminal'
                ],
                rules: {
                  fact: 'size',
                  greaterThan: 0.7
                }
              }
            },
            denominator: {
              count: {
                species: 'melanosome',
                state: ['waiting_on_actin_terminal', 'waiting_on_nuclear_actin_terminal'],
                rules: {
                  fact: 'size',
                  lessThan: 0.7
                }
              }
            }
          }
        }
      },
      clickHandlers: [
        {
          selector: this.organelleSelectorInfo[OrganelleType.Cytoplasm].selector,
          action: this.organelleClick.bind(this, OrganelleType.Cytoplasm)
        },
        {
          selector: this.organelleSelectorInfo[OrganelleType.Nucleus].selector,
          action: this.organelleClick.bind(this, OrganelleType.Nucleus)
        },
        {
          selector: this.organelleSelectorInfo[OrganelleType.Golgi].selector,
          action: this.organelleClick.bind(this, OrganelleType.Golgi)
        },
        {
          selector: this.organelleSelectorInfo[OrganelleType.Intercell].selector,
          action: this.organelleClick.bind(this, OrganelleType.Intercell)
        },
        {
          selector: this.organelleSelectorInfo[OrganelleType.Gates].selector,
          action: this.organelleClick.bind(this, OrganelleType.Gates)
        },
        {
          selector: this.organelleSelectorInfo[OrganelleType.Melanosome].selector,
          action: this.organelleClick.bind(this, OrganelleType.Melanosome)
        }
      ],
      species: [
        'organelles/melanosome.yml',
        'organelles/dots.yml'
      ],
      hotStart: 1000
    }).then((m: any) => {
      this.model = m;
      this.completeLoad();
    });

    autorun(() => {
      if (rootStore.mode === Mode.Normal) {
        this.setState({hoveredOrganelle: null});
      }
    });

    autorun(() => {
      let lightness = this.props.organism.modelProperties.lightness;
      if (this.model) {
        this.model.world.setProperty('lightness', lightness);
      }
    });
  }

  completeLoad() {
    this.model.on('model.step', () => {
      // let saturation = Math.min(model.world.getProperty('saturation'), 1) || 0
      let lightness = Math.min(this.model.world.getProperty('lightness'), 1);
      let grayness = Math.min(this.model.world.getProperty('grayness'), 1);

      if (isNaN(lightness)) {
        lightness = 0;
      }
      if (isNaN(grayness)) {
        grayness = 1;
      }

      let gray = [123, 116, 110],
          orange = [200, 147, 107],
          color = gray.map( (g, i) => Math.floor(((g * grayness) + (orange[i] * (1 - grayness))) + lightness * 30) ),
          colorStr = `rgb(${color.join()})`;

      const cellFill = this.model.view.getModelSvgObjectById('cellshape_0_Layer0_0_FILL');
      if (cellFill) {
        cellFill.setColor(colorStr);
        // cellFill.set({opacity: saturation})
      }

      this.updateCellOpacity();
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

      this.setState({hoveredOrganelle});
    });

    this.model.on('view.hover.exit', (evt: any) => {
      if (rootStore.mode !== Mode.Assay) {
        return;
      }

      this.setState({hoveredOrganelle: null});
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

  makeEverythingTransparentExcept(skip: any) {
    if (this.model) {
      this.makeEverythingOpaque();
      this.model.view.setPropertiesOnAllObjects({opacity: '*0.2'}, true, skip, true);
    }
  }

  makeEverythingOpaque() {
    if (this.model) {
      this.model.view.resetPropertiesOnAllObjects();
    }
  }

  organelleClick(organelleType: OrganelleType) {
    if (rootStore.mode === Mode.Assay) {
      let org = rootStore.organisms.get(this.props.organism.id);
      let organelleInfo = OrganelleRef.create({
        organism: org,
        organelleType
      });
      rootStore.setActiveAssay(organelleInfo);
    } else if (rootStore.mode === Mode.Add || rootStore.mode === Mode.Subtract) {
      rootStore.changeSubstanceLevel(OrganelleRef.create({ organism: this.props.organism, organelleType }));
    }
  }

  addHormone() {
    for (let i = 0; i < 30; i++) {
      this.model.setTimeout(() => {
        this.model.world.createAgent(this.model.world.species[0]);
      },                    50 * i);
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.model && nextProps.organism.modelProperties) {
      Object.keys(nextProps.organism.modelProperties).forEach((key) => {
        this.model.world.setProperty(key, nextProps.organism.modelProperties[key]);
      });
    }

    if (!this.props.doAddHormone && nextProps.doAddHormone) {
      this.addHormone();
    }

    // if (nextProps.addEnzyme) {
    //   let cell: any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`);
    //   cell.style.fill = 'rgb(177,122,50)';
    // } else {
    //   let cell: any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`);
    //   cell.style.fill = 'rgb(241,212,151)';
    // }
  }

  componentDidUpdate() {
    this.updateCellOpacity();
  }

  render() {
    return <div id={this.props.name} className="model" />;
  }
}

export default OrganelleWrapper;