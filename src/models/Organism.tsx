import { types } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';
import { Organelle, IOrganelle, OrganelleType } from './Organelle';
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

export const FieldMouse = Organism.create({
  id: 'Field Mouse',
  organelles: {
    [OrganelleType.Intercell]: {
      type: OrganelleType.Intercell,
      substanceLevels: {
        [SubstanceType.Hormone] : {
          type: SubstanceType.Hormone,
          amount: 286
        }
      }
    },
    [OrganelleType.Cytoplasm]: {
      type: OrganelleType.Cytoplasm,
      substanceLevels: {
        [SubstanceType.GProtein] : {
          type: SubstanceType.GProtein,
          amount: 589
        }
      }
    },
    [OrganelleType.Melanosome]: {
      type: OrganelleType.Melanosome,
      substanceLevels: {
        [SubstanceType.Eumelanin] : {
          type: SubstanceType.Eumelanin,
          amount: 533
        }
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