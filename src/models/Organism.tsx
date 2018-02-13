import { types } from 'mobx-state-tree';
import { SubstanceType, CellPart } from '../Types';
import { v4 as uuid } from 'uuid';
import { Organelle } from './Organelle';

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
    }
  }));
export type IOrganism = typeof Organism.Type;

export const OrganelleInfo = types
  .model('OrganelleRef', {
    organism: types.reference(Organism),
    organelle: types.enumeration('OrganelleType', Object.keys(CellPart).map(key => CellPart[key]))
  });
export type IOrganelleInfo = typeof OrganelleInfo.Type;

export const FieldMouse = Organism.create({
  id: 'Field Mouse',
  organelles: {
    [CellPart.Nucleus]: {
      type: CellPart.Nucleus,
      substanceLevels: {
        [SubstanceType.Substance1] : {
          type: SubstanceType.Substance1,
          amount: 50
        },
        [SubstanceType.Substance2] : {
          type: SubstanceType.Substance2,
          amount: 30
        },
        [SubstanceType.Substance3] : {
          type: SubstanceType.Substance3,
          amount: 40
        },
      }
    },
    [CellPart.Cytoplasm]: {
      type: CellPart.Cytoplasm,
      substanceLevels: {
        [SubstanceType.Substance1] : {
          type: SubstanceType.Substance1,
          amount: 10
        },
        [SubstanceType.Substance2] : {
          type: SubstanceType.Substance2,
          amount: 65
        },
        [SubstanceType.Substance3] : {
          type: SubstanceType.Substance3,
          amount: 85
        },
      }
    }
  }
});

export const ForestMouse = Organism.create({
  id: 'Forest Mouse',
  organelles: {
    [CellPart.Nucleus]: {
      type: CellPart.Nucleus,
      substanceLevels: {
        [SubstanceType.Substance1] : {
          type: SubstanceType.Substance1,
          amount: 10
        },
        [SubstanceType.Substance2] : {
          type: SubstanceType.Substance2,
          amount: 90
        },
        [SubstanceType.Substance3] : {
          type: SubstanceType.Substance3,
          amount: 80
        },
      }
    }
  }
});