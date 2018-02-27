// local type declarations for typeless third-party modules

declare module 'organelle' {
  export class Model {
  }

  export function createModel(parms: Object): any;
}

declare module "*.json" {
  const value: any;
  export default value;
}