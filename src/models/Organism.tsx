import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organelle, IOrganelle, OrganelleType } from './Organelle';
import { SubstanceType } from './Substance';

export enum Darkness {
  LIGHT, DARK, DARKEST
}

export const ModelProperties = types
  .model('ModelProperties', {
    albino: types.optional(types.boolean, false),
    working_tyr1: types.optional(types.boolean, false),
    working_myosin_5a: types.optional(types.boolean, true),
    open_gates: types.optional(types.boolean, false),
    lightness: types.number,
    activated_g_protein: types.number,
    hormone_spawn_period: types.number,
    working_receptor: types.boolean
  });

export const Organism = types
  .model('Organism', {
    id: types.optional(types.identifier(types.string), () => uuid()),
    organelles: types.map(Organelle),
  })
  .views(self => ({
    getLevelForOrganelleSubstance(organelleType: string, substanceType: SubstanceType) {
      let organelle = self.organelles.get(organelleType) as IOrganelle;
      return organelle ? organelle.getLevelForSubstance(substanceType) : 0;
    },
    getDeltaForOrganelleSubstance(organelleType: string, substanceType: SubstanceType) {
      let organelle = self.organelles.get(organelleType) as IOrganelle;
      return organelle ? organelle.getDeltaForSubstance(substanceType) : 0;
    }
  }))
  .views(self => ({
    getTotalForOrganelleSubstance(organelleType: string, substanceType: SubstanceType) {
      let organelle = self.organelles.get(organelleType) as IOrganelle;
      return organelle ?
        self.getLevelForOrganelleSubstance(organelleType, substanceType) +
          self.getDeltaForOrganelleSubstance(organelleType, substanceType) :
        0;
    }
  }))
  .views(self => ({
    get darkness() {
      let eumelaninLevel = self.getTotalForOrganelleSubstance(
        OrganelleType.Melanosome, SubstanceType.Eumelanin
      );
      return eumelaninLevel < 200
        ? Darkness.LIGHT
        : eumelaninLevel > 400
          ? Darkness.DARKEST
          : Darkness.DARK;
    },
  }))
  .views(self => ({
    get modelProperties() {
      let lightness,
          percentGProtein,
          workingReceptor;
      switch (self.darkness) {
        case Darkness.LIGHT:
        default:
          lightness = 10;
          percentGProtein = 0;
          break;
        case Darkness.DARK:
          lightness = -1;
          percentGProtein = 80;
          break;
        case Darkness.DARKEST:
          lightness = -2.5;
          percentGProtein = 100;
      }
      switch (self.id) {
        case 'Beach Mouse':
          workingReceptor = false;
          break;
        case 'Field Mouse':
        default:
          workingReceptor = true;
          break;
      }
      return {
        albino: false,
        working_tyr1: false,
        working_myosin_5a: true,
        open_gates: false,
        lightness: lightness,
        activated_g_protein: percentGProtein,
        hormone_spawn_period: 40,
        working_receptor: workingReceptor
      };
    },
    getImageSrc() {
      switch (self.darkness) {
        case Darkness.LIGHT:
        default:
          return 'assets/sandrat-light.png';
        case Darkness.DARK:
          return 'assets/sandrat-dark.png';
        case Darkness.DARKEST:
          return 'assets/sandrat-darkest.png';
      }
    },
  }))
  .actions(self => ({
    incrementOrganelleSubstance(organelleType: string, substanceType: SubstanceType, amount: number) {
      let organelle = self.organelles.get(organelleType) as IOrganelle;
      if (organelle) {
        organelle.incrementSubstance(substanceType, amount);
      } else {
        let newOrganelle = Organelle.create({ type: organelleType });
        newOrganelle.incrementSubstance(substanceType, amount);
        self.organelles.set(organelleType, newOrganelle);
      }
    },
    step(msPassed: number) {
      Object.keys(OrganelleType).map(key => OrganelleType[key]).forEach(organelleType => {
        let organelle = self.organelles.get(organelleType) as IOrganelle;
        if (!organelle) {
          organelle = Organelle.create({type: organelleType});
          self.organelles.set(organelleType, organelle);
        }
        organelle.step(msPassed, self);
      });
    }
  }));
export type IOrganism = typeof Organism.Type;

export const OrganelleRef = types
  .model('OrganelleRef', {
    organism: types.reference(Organism),
    organelleType: types.enumeration('OrganelleType', Object.keys(OrganelleType).map(key => OrganelleType[key]))
  });
export type IOrganelleRef = typeof OrganelleRef.Type;

export const BeachMouse = Organism.create({
  id: 'Beach Mouse',
  organelles: {
    [OrganelleType.Intercell]: {
      type: OrganelleType.Intercell,
      substanceLevels: {
        [SubstanceType.Hormone] : {
          type: SubstanceType.Hormone,
          amount: 125
        }
      }
    },
    [OrganelleType.Cytoplasm]: {
      type: OrganelleType.Cytoplasm,
      substanceLevels: {
        [SubstanceType.GProtein] : {
          type: SubstanceType.GProtein,
          amount: 0
        }
      }
    },
    [OrganelleType.Melanosome]: {
      type: OrganelleType.Melanosome,
      substanceLevels: {
        [SubstanceType.Eumelanin] : {
          type: SubstanceType.Eumelanin,
          amount: 0
        },
        [SubstanceType.Pheomelanin] : {
          type: SubstanceType.Pheomelanin,
          amount: 316
        }
      }
    }
  }
});

export const FieldMouse = Organism.create({
  id: 'Field Mouse',
  organelles: {
    [OrganelleType.Intercell]: {
      type: OrganelleType.Intercell,
      substanceLevels: {
        [SubstanceType.Hormone] : {
          type: SubstanceType.Hormone,
          amount: 125
        }
      }
    },
    [OrganelleType.Cytoplasm]: {
      type: OrganelleType.Cytoplasm,
      substanceLevels: {
        [SubstanceType.GProtein] : {
          type: SubstanceType.GProtein,
          amount: 170
        }
      }
    },
    [OrganelleType.Melanosome]: {
      type: OrganelleType.Melanosome,
      substanceLevels: {
        [SubstanceType.Eumelanin] : {
          type: SubstanceType.Eumelanin,
          amount: 340
        },
        [SubstanceType.Pheomelanin] : {
          type: SubstanceType.Pheomelanin,
          amount: 147
        }
      }
    }
  }
});