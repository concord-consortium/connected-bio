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
        selector: '#nucleus'
      },
      // 'cytoplasm': {
      //   selector: '#melanocyte_x5F_cell, #microtubules_x5F_grouped'
      // },
      'golgi': {
        selector: '#golgi_x5F_apparatus'
      },
      'gates': {
        selector: '.gate-a, .gate-b, .gate-c, .gate-d'
      },
      'none': {
        selector: ''
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
        // {
        //   selector: this.organelleInfo.cytoplasm.selector,
        //   action: this.organelleClick.bind(this, 'cytoplasm')
        // },
        {
          selector: this.organelleInfo.nucleus.selector,
          action: this.organelleClick.bind(this, 'nucleus')
        },
        {
          selector: this.organelleInfo.golgi.selector,
          action: this.organelleClick.bind(this, 'golgi')
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
    });

    this.model.on('view.hover.enter', (evt: any) => {
      if (this.props.mode !== 'assay') {
        return;
      }

      const highlightClasses = Object.keys(this.organelleInfo)
        .reduce((accumulator, organelle) => {
          accumulator.push(this.organelleInfo[organelle].selector);
          return accumulator;
        },      [])
        .join(',');
      let matches = evt.target._organelle.matches({selector: highlightClasses});
      if (matches) {
        let keepOpaque = matches;
        let activeAssaySelector = this.organelleInfo[this.props.activeAssay].selector;
        if (activeAssaySelector) {
          keepOpaque += ',' + activeAssaySelector;
        }
        this.makeEverythingTransparentExcept({selector: keepOpaque});
      }
    });

    this.model.on('view.hover.exit', (evt: any) => {
      if (this.props.mode !== 'assay') {
        return;
      }

      this.makeEverythingTransparentExcept({selector: this.organelleInfo[this.props.activeAssay].selector});
    });
  }

  makeEverythingTransparentExcept(skip: any) {
    this.makeEverythingOpaque();
    this.model.view.setPropertiesOnAllObjects({opacity: '*0.2'}, true, skip, true);
  }

  makeEverythingOpaque() {
    this.model.view.resetPropertiesOnAllObjects();
  }

  organelleClick(organelle: string) {
    if (this.props.mode === 'assay') {
      this.props.setActiveAssay(organelle);
      this.makeEverythingTransparentExcept({selector: this.organelleInfo[organelle].selector});
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

    // if (nextProps.addEnzyme) {
    //   let cell: any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`);
    //   cell.style.fill = 'rgb(177,122,50)';
    // } else {
    //   let cell: any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`);
    //   cell.style.fill = 'rgb(241,212,151)';
    // }

    if (this.props.mode !== 'assay' && nextProps.mode === 'assay') {
      this.makeEverythingTransparentExcept({selector: this.organelleInfo[nextProps.activeAssay].selector});
    } else if (this.props.mode === 'assay' && nextProps.mode !== 'assay') {
      this.makeEverythingOpaque();
    }
  }

  render() {
    return <div id={this.props.name} className="model" />;
  }
}

export default OrganelleWrapper;