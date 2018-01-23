import * as React from 'react';
declare var Organelle: any;

interface OrganelleWrapper {
  name: string;
  modelProperties: any;
  showBinding: boolean;
  doAddHormone: boolean;
  addEnzyme: boolean;
  setActiveAssay: Function;
  currentView: any;
  setGraphState: Function;
  mode: string;
}

class OrganelleWrapper extends React.Component<any, any> {
    model: any;
    organelleInfo: any = {
      'nucleus': {
        selector: '#nucleus_x5F_A',
        opacity: 1
      },
      'cytoplasm': {
        selector: '#cellshape_0_Layer0_0_FILL',
        opacity: .5
      }
    };
  constructor(props: OrganelleWrapper) {
    super(props);
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
          selector: this.organelleInfo.cytoplasm.selector,
          action: this.organelleClick.bind(this, 'cytoplasm')
        },
        {
          selector: this.organelleInfo.nucleus.selector,
          action: this.organelleClick.bind(this, 'nucleus')
        },
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
    });
  }

  organelleClick(organelle: string) {
    if (this.props.mode === 'assay') {
      this.props.setActiveAssay(organelle);
    }
  }

  addHormone() {
    for (let i = 0; i < 30; i++) {
      this.model.setTimeout(() => {
        this.model.world.createAgent(this.model.world.species[0]);
      },                    50 * i);
    }
  }

  adjustOrganelleOpacity(props: any) {
    let {name, activeAssay, mode} = props;

    let opacityMultiplier = mode === 'assay' ? .25 : 1;
    Object.keys(this.organelleInfo).forEach(organelle => {
      let cell: any = document.querySelector(`#${name} ` + this.organelleInfo[organelle].selector);
      cell.style.fillOpacity = this.organelleInfo[organelle].opacity * opacityMultiplier;
    });

    if (mode === 'assay' && activeAssay !== 'none') {
      let organelleElement: any = document.querySelector(
        `#${name} ` + this.organelleInfo[activeAssay].selector);
      organelleElement.style.fillOpacity = this.organelleInfo[activeAssay].opacity;
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

    if (nextProps.addEnzyme) {
      let cell: any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`);
      cell.style.fill = 'rgb(177,122,50)';
    } else {
      let cell: any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`);
      cell.style.fill = 'rgb(241,212,151)';
    }

    this.adjustOrganelleOpacity(nextProps);
  }

  render() {
    return <div id={this.props.name} className="model" />;
  }
}

export default OrganelleWrapper;