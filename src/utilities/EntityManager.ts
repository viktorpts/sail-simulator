import GameEntity from "../entities/GameEntity";
import GameSystem from "../systems/GameSystem";
import ComponentMask, { applyMask } from "./ComponentMask";
import { ComponentGroup, IndexByTypeAndId, IndexByType, IndexById, EntityIndexById } from "./Collections";
import GameComponent from "../components/GameComponent";

export default class EntityManager {
    entitites: GameEntity[];
    systems: GameSystem[];

    constructor() {
        this.entitites = [];
        this.systems = [];
    }

    update() {
        // Iterate systems and for each system, get it's mask
        // Apply mask to list of all entities, obtaining component groups (indexes)
        // Feed component block and components groups into the system's parser
        // Profit
        for (let system of this.systems) {
            const index = this.getIndexes(system.mask);
            system.parse(index.entities, index.components, index.componentsById);
        }
    }

    getIndexes(mask: ComponentMask) {
        // TODO: memoization, update when list of entities is modified (create, free)
        const entities: IndexByTypeAndId<ComponentGroup> = {};
        const components: IndexByType<GameComponent[]> = {};
        const componentsById: IndexById<GameComponent> = {};

        for (let entityIndex = 0; entityIndex < this.entitites.length; entityIndex++) {
            const entity = this.entitites[entityIndex];
            const groupIndex = applyMask(entity.components, mask);
            for (let entityType of Object.getOwnPropertyNames(groupIndex)) {
                if (entities.hasOwnProperty(entityType) === false) {
                    entities[entityType] = new EntityIndexById<ComponentGroup>();
                }
                const componentGroup = groupIndex[entityType];
                if (componentGroup !== null) {
                    entities[entityType][entity.id] = componentGroup;
                    for (let componentType of Object.getOwnPropertyNames(componentGroup)) {
                        if (components.hasOwnProperty(componentType) === false) {
                            components[componentType] = [];
                        }
                        const component = componentGroup[componentType];
                        if (component !== null) {
                            components[componentType].push(component);
                            componentsById[component.id] = component;
                        }
                    }
                }
            }
        }

        return {
            entities,
            components,
            componentsById
        };
    }
}