import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organelle, IOrganelle, OrganelleType } from './Organelle';
import { SubstanceType } from './Substance';

export const ModelProperties = types
  .model('ModelProperties', {
    albino: types.optional(types.boolean, false),
    working_tyr1: types.optional(types.boolean, false),
    working_myosin_5a: types.optional(types.boolean, true),
    open_gates: types.optional(types.boolean, false),
    // lightness: types.number,
    eumelanin: types.number,
    hormone_spawn_period: types.number,
    working_receptor: types.boolean
  });

export const Organism = types
  .model('Organism', {
    id: types.optional(types.identifier(types.string), () => uuid()),
    organelles: types.map(Organelle),
    cellLightness: types.maybe(types.number)
  })
  .actions(self => ({
    setCellLightness(lightness: number) {
      self.cellLightness = lightness;
    }
  }))
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
    get lightness() {
      // if cell model has already stepped and calculated lightness
      if (typeof self.cellLightness === 'number') {
        return self.cellLightness;
      }
      // else return a default value based on the amount of melanin
      let eumelaninLevel = self.getTotalForOrganelleSubstance(
        OrganelleType.Melanosome, SubstanceType.Eumelanin
      );
      return eumelaninLevel < 200
        ? 1
        : eumelaninLevel > 400
          ? 0
          : 0.2;
    }
  }))
  .views(self => ({
    get modelProperties() {
      let eumelaninLevel = self.getTotalForOrganelleSubstance(
            OrganelleType.Melanosome, SubstanceType.Eumelanin
          ),
          // normalize 200-370 to 0-100
          eumelaninInCell = Math.max(0, Math.min(100, (eumelaninLevel - 200) / 1.7)),
          workingReceptor;

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
        eumelanin: eumelaninInCell,
        hormone_spawn_period: 40,
        working_receptor: workingReceptor
      };
    },
    getImageSrc() {
      // `lightness` should always be 0.0, 0.2, 0.4..., so we could just generate the image
      // name, but just in case it isn't it's best to use ranges
      if (self.lightness < 0.19) {
        return 'assets/sandrat-00.png';
      } else if (self.lightness < 0.39) {
        return 'assets/sandrat-02.png';
      } else if (self.lightness < 0.59) {
        return 'assets/sandrat-04.png';
      } else if (self.lightness < 0.79) {
        return 'assets/sandrat-06.png';
      } else if (self.lightness < 0.99) {
        return 'assets/sandrat-08.png';
      } else {
        return 'assets/sandrat-10.png';
      }
    },
  }))
  .actions(self => ({
    incrementOrganelleSubstance(organelleType: string, substanceType: SubstanceType, amount: number, currentTime: number) {
      let organelle = self.organelles.get(organelleType) as IOrganelle;
      if (organelle) {
        organelle.incrementSubstance(substanceType, amount, currentTime);
      } else {
        let newOrganelle = Organelle.create({ type: organelleType });
        newOrganelle.incrementSubstance(substanceType, amount, currentTime);
        self.organelles.set(organelleType, newOrganelle);
      }
    },
    step(currentTime: number) {
      Object.keys(OrganelleType).map(key => OrganelleType[key]).forEach(organelleType => {
        let organelle = self.organelles.get(organelleType) as IOrganelle;
        if (!organelle) {
          organelle = Organelle.create({type: organelleType});
          self.organelles.set(organelleType, organelle);
        }
        organelle.step(currentTime, self);
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