// import Organism from './Organism';
// import { CellPart, Substance } from '../Types';

// export enum MouseType {
//   Forest = 'FOREST',
//   Field = 'FIELD'
// }

// let typeSubstances = {
//   [MouseType.Field]: {
//     [CellPart.Cytoplasm]: {
//       [Substance.Substance1]: 20,
//       [Substance.Substance2]: 50,
//       [Substance.Substance3]: 30
//     },
//     [CellPart.Nucleus]: {
//       [Substance.Substance1]: 90,
//       [Substance.Substance2]: 15,
//       [Substance.Substance3]: 0
//     },
//     [CellPart.Golgi]: {
//       [Substance.Substance1]: 20,
//       [Substance.Substance2]: 50,
//       [Substance.Substance3]: 30
//     },
//     [CellPart.Intercell]: {
//       [Substance.Substance1]: 0,
//       [Substance.Substance2]: 0,
//       [Substance.Substance3]: 70
//     },
//     [CellPart.Gates]: {
//       [Substance.Substance1]: 30,
//       [Substance.Substance2]: 50,
//       [Substance.Substance3]: 70
//     }
//   },
//   [MouseType.Forest]: {
//     [CellPart.Cytoplasm]: {
//       [Substance.Substance1]: 30,
//       [Substance.Substance2]: 30,
//       [Substance.Substance3]: 30
//     },
//     [CellPart.Nucleus]: {
//       [Substance.Substance1]: 30,
//       [Substance.Substance2]: 30,
//       [Substance.Substance3]: 30
//     },
//     [CellPart.Golgi]: {
//       [Substance.Substance1]: 30,
//       [Substance.Substance2]: 30,
//       [Substance.Substance3]: 30
//     },
//     [CellPart.Intercell]: {
//       [Substance.Substance1]: 30,
//       [Substance.Substance2]: 30,
//       [Substance.Substance3]: 30
//     },
//     [CellPart.Gates]: {
//       [Substance.Substance1]: 30,
//       [Substance.Substance2]: 30,
//       [Substance.Substance3]: 30
//     }
//   }
// };

// export default class Mouse extends Organism {
//   readonly type: MouseType;
//   constructor(name: string, type: MouseType) {
//     super(name, typeSubstances[type]);
//     this.type = type;
//   }

//   getImageSrc(): string {
//     if (this.type === MouseType.Field) {
//       return 'assets/sandrat-light.png';
//     } else {
//       return 'assets/sandrat-dark.png';
//     }
//   }
// }