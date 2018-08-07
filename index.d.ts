// local type declarations for typeless third-party modules

declare module 'organelle' {
  export class Model {
  }

  export function createModel(parms: Object): any;
}

declare module 'protein-viewer' {
  export class ProteinWrapper {
  	render(): JSX.Element | null;
  	setState(state: any): any;
  	forceUpdate(): any;
  	props: any;
  	state: any;
  	context: any;
  	refs: any;
  }
}

declare module 'cb-populations' {
  export class PopulationsModelPanel {
  	render(): JSX.Element | null;
  	setState(state: any): any;
  	forceUpdate(): any;
  	props: any;
  	state: any;
  	context: any;
  	refs: any;
  }
}

declare module "*.json" {
  const value: any;
  export default value;
}