import { types } from 'mobx-state-tree';
import { Mode } from '../Types';

const RootStore = types
  .model('RootStore', {
    mode: types.enumeration('Mode', Object.keys(Mode).map(key => Mode[key]))
  })
  .actions(self => {
    function setMode(newMode: string) {
      self.mode = newMode;
    }

    return {
      setMode
    };
  });
export const rootStore = RootStore.create({mode: Mode.Normal});