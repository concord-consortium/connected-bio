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
      element: this.props.name,
      background: {
        file: 'assets/melanocyte.svg',
        selector: '#cell'
      },
      properties: modelProperties,
      calculatedProperties: {},
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
        'organelles/hexagon.yml',
        'organelles/triangle.yml',
        'organelles/g-protein.yml',
        'organelles/g-protein-part.yml'
      ]
    }).then((m: any) => {
      this.model = m;
      this.completeLoad();
    });
  }

  completeLoad() {
    this.model.setTimeout(() => {
      let cell: any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`);
      if (cell) {
        cell.style['fill-opacity'] = 0.5;
        cell.style.fill = 'rgb(241,212,151)';
        this.adjustOrganelleOpacity(this.props);
      } else {
        // Keep retrying query selector until SVG is loaded
        this.completeLoad();
      }
    },                    10);
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
    return <svg id={this.props.name} width="500px" viewBox={this.props.viewBox} className="model" />;
  }
}

export default OrganelleWrapper;