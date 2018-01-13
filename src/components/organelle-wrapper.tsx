/*globals Organelle Snap */
import * as React from 'react';
declare var Organelle: any;

interface OrganelleWrapper {
  name: string,
  modelProperties: any,
  showBinding: boolean,
  doAddHormone: boolean,
  addEnzyme: Function,
  currentView: any,
  setGraphState: Function
}

class OrganelleWrapper extends React.Component<any, any> {
    model: any;
    comgeneralCell: any;
  constructor(props: OrganelleWrapper) {
    super(props);
    this.model = null;
    this.showHexBinding = this.showHexBinding.bind(this);
    this.addHormone = this.addHormone.bind(this);

    this.props.modelProperties;
  }

  componentDidMount() {
    const {modelProperties, currentView} = this.props;
    modelProperties["receptor_is_bound"] = false;

    let speciesList;
    console.log("currentView",currentView)
    if (currentView === "golgi") {
      speciesList = [
        "organelles/melanosome.yml"
      ]
    } else {
      speciesList = [
        "organelles/hexagon.yml",
        "organelles/triangle.yml",
        "organelles/g-protein.yml",
        "organelles/g-protein-part.yml"
      ]
    }

    Organelle.createModel({
      element: this.props.name,
      background: {
        file: "assets/melanocyte.svg",
        selector: "#cell"
      },
      properties: modelProperties,
      calculatedProperties: {
        saturation: {
          ratio: {
            numerator: {
              count: {
                species: "melanosome",
                state: [
                  "waiting_on_actin_terminal",
                  "waiting_on_nuclear_actin_terminal"
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
                species: "melanosome",
                state: "waiting_on_nuclear_actin_terminal"
              }
            },
            denominator: 10
          }
        },
        grayness: {
          ratio: {
            numerator: {
              count: {
                species: "melanosome",
                state: [
                  "waiting_on_actin_terminal",
                  "waiting_on_nuclear_actin_terminal"
                ],
                rules: {
                  fact: "size",
                  greaterThan: 0.7
                }
              }
            },
            denominator: {
              count: {
                species: "melanosome",
                state: ["waiting_on_actin_terminal", "waiting_on_nuclear_actin_terminal"],
                rules: {
                  fact: "size",
                  lessThan: 0.7
                }
              }
            }
          }
        }
      },
      clickHandlers: [
        {
          selector: "#melanocyte_x5F_cell",
          action: this.comgeneralCell
        },
      ],
      species: speciesList,
    }).then((m:any) => {
      this.model = m;

      this.model.setTimeout(() => {
        let cell = document.getElementById("cellshape_0_Layer0_0_FILL")
        if (cell) {
            cell.style["fill-opacity"] = 0.5;
        }
        
        let cellFill:any = document.querySelector(`#${this.props.name} #cellshape_0_Layer0_0_FILL`)
        if (cellFill) {
            cellFill.style["fill"] = "rgb(241,212,151)";
        }
      }, 1);
    });
  }

  generalCell() {
    console.log("in a cell")
  }

  addHormone() {
    for (let i = 0; i < 30; i++) {
      this.model.setTimeout(() => {
        this.model.world.createAgent(this.model.world.species[0]);
      }, 50 * i);
    }
  }

  showHexBinding() {
    var hex = this.model.world.createAgent(this.model.world.species[0]);
    hex.state = "heading_to_receptor";
    var that = this;

    var transformReceptor = function() {
      // var protein = Snap.select("#receptor_x5F_protein");
      
      let cell: any = document.querySelector(`#${that.props.name} #sensor_0_Layer0_0_FILL`)
      cell.style["fill"] = "rgb(239,1,82)";
      cell = document.querySelector(`#${that.props.name} #piece1_0_Layer0_0_FILL`)
      cell.style["fill"] = "rgb(239,1,82)";
    }
    var gProteinPart:any;

    var waitingForGProteinPart = function() {
      if (gProteinPart.dead) {
        hex.task_die(true);

        let cell:any = document.querySelector(`#${that.props.name} #sensor_0_Layer0_0_FILL`)
        cell.style["fill"] = "rgb(201, 56, 104)";
        cell = document.querySelector(`#${that.props.name} #piece1_0_Layer0_0_FILL`)
        cell.style["fill"] = 'url("#_Radial5")';
        that.model.world.setProperty("receptor_is_bound", false);
        that.model.world.agents[0].state = "away_from_receptor";
        that.props.setGraphState("B");
      } else {
        that.model.setTimeout(waitingForGProteinPart, 500)
      }
    }

    var waitingForGProtein = function() {
      if (that.model.world.agents[0].state === "stick_to_receptor") {
        that.props.setGraphState("AB3");
        gProteinPart = that.model.world.createAgent(that.model.world.species[3]);
        that.model.setTimeout(waitingForGProteinPart, 500)
      } else {
        that.model.setTimeout(waitingForGProtein, 500)
      }
    }

    var waitingForBinding = function() {
      if (hex.state === "waiting_on_receptor") {
        transformReceptor();
        that.model.world.setProperty("receptor_is_bound", true);
        that.props.setGraphState("AB2");
        waitingForGProtein();
      } else {
        console.log(that.props.name, that.model.world.agents.length);
        that.model.setTimeout(waitingForBinding, 100)
      }
    }
    
    this.model.setTimeout(waitingForBinding, 500)
  }

  componentWillReceiveProps(nextProps:any) {
    console.log(nextProps);
    if (nextProps.modelProperties) {
      Object.keys(nextProps.modelProperties).forEach((key) => {
        this.model.world.setProperty(key, nextProps.modelProperties[key]);
      });
    }

    if (!this.props.showBinding && nextProps.showBinding) {
      this.showHexBinding();
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