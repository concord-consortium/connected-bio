import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organelle, OrganelleType } from './Organelle';
import { SubstanceType } from './Substance';

export const ModelProperties = types
  .model('ModelProperties', {
    albino: types.optional(types.boolean, false),
    working_tyr1: types.optional(types.boolean, false),
    working_myosin_5a: types.optional(types.boolean, true),
    open_gates: types.optional(types.boolean, false)
  });

export const Organism = types
  .model('Organism', {
    id: types.optional(types.identifier(types.string), () => uuid()),
    organelles: types.map(Organelle),
    modelProperties: types.optional(ModelProperties, () => ModelProperties.create())
  })
  .views(self => ({
    getImageSrc() {
      return self.id === 'Field Mouse' ? 'assets/sandrat-light.png' : 'assets/sandrat-dark.png';
    },
    getLevelForOrganelleSubstance(organelle: string, substanceType: SubstanceType) {
      return self.organelles.get(organelle) ? self.organelles.get(organelle).getLevelForSubstance(substanceType) : 0;
    },
    getDeltaForOrganelleSubstance(organelle: string, substanceType: SubstanceType) {
      return self.organelles.get(organelle) ? self.organelles.get(organelle).getDeltaForSubstance(substanceType) : 0;
    }
  }))
  .actions(self => ({
    incrementOrganelleSubstance(organelleType: string, substanceType: SubstanceType, amount: number) {
      let organelle = self.organelles.get(organelleType);
      if (organelle) {
        organelle.incrementSubstance(substanceType, amount);
      } else {
        let newOrganelle = Organelle.create({ type: organelleType });
        newOrganelle.incrementSubstance(substanceType, amount);
        self.organelles.set(organelleType, newOrganelle);
      }
    },
    step(msPassed: number) {
      self.organelles.keys().forEach(organelleKey => {
        self.organelles.get(organelleKey).step(msPassed);
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

export const FieldMouse = Organism.create({
  id: 'Field Mouse',
  organelles: {
    [OrganelleType.Nucleus]: {
      type: OrganelleType.Nucleus,
      substanceLevels: {
        [SubstanceType.Hormone] : {
          type: SubstanceType.Hormone,
          amount: 286
        },
        [SubstanceType.GProtein] : {
          type: SubstanceType.GProtein,
          amount: 589
        },
        [SubstanceType.Eumelanin] : {
          type: SubstanceType.Eumelanin,
          amount: 533
        },
      }
    },
    [OrganelleType.Cytoplasm]: {
      type: OrganelleType.Cytoplasm,
      substanceLevels: {
        [SubstanceType.Hormone] : {
          type: SubstanceType.Hormone,
          amount: 10
        },
        [SubstanceType.GProtein] : {
          type: SubstanceType.GProtein,
          amount: 65
        },
        [SubstanceType.Eumelanin] : {
          type: SubstanceType.Eumelanin,
          amount: 85
        },
      }
    }
  }
});

export const ForestMouse = Organism.create({
  id: 'Forest Mouse',
  organelles: {
    [OrganelleType.Nucleus]: {
      type: OrganelleType.Nucleus,
      substanceLevels: {
        [SubstanceType.Hormone] : {
          type: SubstanceType.Hormone,
          amount: 10
        },
        [SubstanceType.GProtein] : {
          type: SubstanceType.GProtein,
          amount: 90
        },
        [SubstanceType.Eumelanin] : {
          type: SubstanceType.Eumelanin,
          amount: 80
        },
      }
    }
  }
});