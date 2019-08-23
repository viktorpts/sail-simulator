import GameEntity from "../entities/GameEntity";
import GameSystem from "../systems/GameSystem";
import ComponentMask from "./ComponentMask";
import { ComponentIndex, checkMask, ComponentBlock, ComponentGroup } from "./ComponentCollections";

export default class EntityManager {
    entitites: GameEntity[];
    components: ComponentBlock[];
    componentIndex: ComponentIndex;

    systems: GameSystem[];

    constructor() {
        this.entitites = [];
        this.components = [];
        this.systems = [];
    }

    update() {
        // Iterate systems and for each system, get it's mask
        // Apply mask to list of all entities, obtaining component groups (indexes)
        // Feed component block and components groups into the system's parser
        // Profit
        for (let system of this.systems) {
            system.parse(this.components, this.getComponentGroups(system.mask));
        }
    }

    getComponentGroups(mask: ComponentMask): ComponentGroup[] {
        // TODO: memoization, update when list of entities is modified (create, free)
        const groups: ComponentGroup[] = [];
        for (let entityId = 0; entityId < this.entitites.length; entityId++) {
            if (checkMask(this.entitites[entityId], mask)) {
                groups.push(this.getGroupFromEntity(this.entitites[entityId], mask));
            }
        }
        return groups;
    }

    getGroupFromEntity(entity: GameEntity, mask: ComponentMask): ComponentGroup {
        const group: ComponentGroup = [];
        for (let componentType of Object.keys(mask)) {
            group.push([this.componentIndex[componentType], entity.components[componentType]]);
        }
        return group;
    }
}