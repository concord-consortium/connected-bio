import * as React from 'react';
import { CellPart, Mode, AssayInfo } from '../Types';

declare var Organelle: any;

interface OrganelleWrapperProps {
  name: string;
  modelProperties: any;
  doAddHormone: boolean;
  addEnzyme: boolean;
  currentView: any;
  mode: Mode;
  activeAssay: AssayInfo;
  lockedAssays: AssayInfo[];
  setActiveAssay(activeAssay: AssayInfo): void;
}

interface OrganelleWrapperState {
  hoveredOrganelle: any;
}

class OrganelleWrapper extends React.Component<OrganelleWrapperProps, OrganelleWrapperState> {
    model: any;
    organelleInfo: {[cellPart in CellPart]: any} = {
      [CellPart.Nucleus]: {
        selector: '#nucleus'
      },
      [CellPart.Cytoplasm]: {
        selector: '#cytoplasm',
        opaqueSelector: '#cellshape_0_Layer0_0_FILL'
      },
      [CellPart.Golgi]: {
        selector: '#golgi_x5F_apparatus'
      },
      [CellPart.Gates]: {
        selector: '.gate-a, .gate-b, .gate-c, .gate-d'
      },
      [CellPart.Intercell]: {
        selector: `#intercell`,
        opaqueSelector: '#Layer6_0_FILL'
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
    const {modelProperties} = this.props;

    Organelle.createModel({
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
        lightness: {
          ratio: {
            numerator: {
              count: {
                species: 'melanosome',
                state: 'waiting_on_nuclear_actin_terminal'
              }
            },
            denominator: 10
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
          selector: this.organelleInfo[CellPart.Cytoplasm].selector,
          action: this.organelleClick.bind(this, CellPart.Cytoplasm)
        },
        {
          selector: this.organelleInfo[CellPart.Nucleus].selector,
          action: this.organelleClick.bind(this, CellPart.Nucleus)
        },
        {
          selector: this.organelleInfo[CellPart.Golgi].selector,
          action: this.organelleClick.bind(this, CellPart.Golgi)
        },
        {
          selector: this.organelleInfo[CellPart.Intercell].selector,
          action: this.organelleClick.bind(this, CellPart.Intercell)
        },
        {
          selector: this.organelleInfo[CellPart.Gates].selector,
          action: this.organelleClick.bind(this, CellPart.Gates)
        }
      ],
      species: [
        'organelles/melanosome.yml',
        'organelles/hexagon.yml',
        'organelles/triangle.yml'
        // 'organelles/g-protein.yml',
        // 'organelles/g-protein-part.yml'
      ],
      hotStart: 1000
    }).then((m: any) => {
      this.model = m;
      this.completeLoad();
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
      if (this.props.mode !== Mode.Assay) {
        return;
      }

      const hoveredOrganelle = Object.keys(this.organelleInfo)
        .reduce((accumulator, organelle) => {
          let selector = this.organelleInfo[organelle].selector;
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
      if (this.props.mode !== Mode.Assay) {
        return;
      }

      this.setState({hoveredOrganelle: null});
    });
  }

  getOpaqueSelector(cellPart: CellPart) {
    return this.organelleInfo[cellPart].opaqueSelector ?
      this.organelleInfo[cellPart].opaqueSelector :
      this.organelleInfo[cellPart].selector;
  }

  updateCellOpacity() {
    if (this.props.mode === Mode.Assay) {
      let opaqueSelectors: string[] = [];
      this.props.lockedAssays.forEach((lockedAssay) => {
        opaqueSelectors.push(this.getOpaqueSelector(lockedAssay.cellPart));
      });
      if (this.props.activeAssay) {
        opaqueSelectors.push(this.getOpaqueSelector(this.props.activeAssay.cellPart));
      }
      if (this.state.hoveredOrganelle) {
        opaqueSelectors.push(this.getOpaqueSelector(this.state.hoveredOrganelle));
      }

      this.makeEverythingTransparentExcept({selector: opaqueSelectors.join(',')});
    } else {
      this.makeEverythingOpaque();
    }
  }

  makeEverythingTransparentExcept(skip: any) {
    this.makeEverythingOpaque();
    this.model.view.setPropertiesOnAllObjects({opacity: '*0.2'}, true, skip, true);
  }

  makeEverythingOpaque() {
    this.model.view.resetPropertiesOnAllObjects();
  }

  organelleClick(organelle: CellPart) {
    if (this.props.mode === Mode.Assay) {
      this.props.setActiveAssay({ cellPart: organelle });
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
    if (nextProps.modelProperties) {
      Object.keys(nextProps.modelProperties).forEach((key) => {
        this.model.world.setProperty(key, nextProps.modelProperties[key]);
      });
    }

    if (!this.props.doAddHormone && nextProps.doAddHormone) {
      this.addHormone();
    }

    if (this.props.mode === Mode.Assay && nextProps.mode !== Mode.Assay) {
      this.setState({hoveredOrganelle: null});
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