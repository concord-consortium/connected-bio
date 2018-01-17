import * as React from 'react';
declare var Organelle: any;

interface OrganelleWrapper {
  name: string,
  modelProperties: any,
  showBinding: boolean,
  doAddHormone: boolean,
  addEnzyme: boolean,
  setActiveAssay: Function,
  currentView: any,
  setGraphState: Function
}

class OrganelleWrapper extends React.Component<any, any> {
    model: any;
  constructor(props: OrganelleWrapper) {
    super(props);
    this.model = null;
    this.addHormone = this.addHormone.bind(this);
  }

  componentDidMount() {
    const {modelProperties} = this.props;

    Organelle.createModel({
      element: this.props.name,
      background: {
        file: "assets/melanocyte.svg",
        selector: "#cell"
      },
      properties: modelProperties,
      calculatedProperties: {},
      clickHandlers: [
        {
          selector: "#melanocyte_x5F_cell",
          action: this.organelleClick.bind(this, "cytoplasm")
        },
        {
          selector: "#nucleus_x5F_A",
          action: this.organelleClick.bind(this, "nucleus")
        },
      ],
      species: [
        "organelles/hexagon.yml",
        "organelles/triangle.yml",
        "organelles/g-protein.yml",
        "organelles/g-protein-part.yml"
      ]
    }).then((m:any) => {
      this.model = m;

      this.model.setTimeout(() => {
        let cell:any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`)
        if (cell) {
            cell.style["fill-opacity"] = 0.5;
            cell.style["fill"] = "rgb(241,212,151)";
        }
      }, 10);
    });
  }

  organelleClick(organelle:string) {
    this.props.setActiveAssay(organelle)
  }

  addHormone() {
    for (let i = 0; i < 30; i++) {
      this.model.setTimeout(() => {
        this.model.world.createAgent(this.model.world.species[0]);
      }, 50 * i);
    }
  }

  componentWillReceiveProps(nextProps:any) {
    console.log(nextProps);
    if (nextProps.modelProperties) {
      Object.keys(nextProps.modelProperties).forEach((key) => {
        this.model.world.setProperty(key, nextProps.modelProperties[key]);
      });
    }

    if (!this.props.doAddHormone && nextProps.doAddHormone) {
      this.addHormone();
    }

    if (nextProps.addEnzyme) {
      let cell:any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`)
      cell.style["fill"] = "rgb(177,122,50)";
    } else {
      let cell:any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`)
      cell.style["fill"] = "rgb(241,212,151)";
    }
  }

  render() {
    return <svg id={this.props.name} width="500px" viewBox={this.props.viewBox} className="model" />;
  }
}

export default OrganelleWrapper;