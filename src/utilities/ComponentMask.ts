import { ComponentGroup, IndexByType, GroupDefinition } from "./Collections";
import GameEntity from "../entities/GameEntity";
import GameComponent from "../components/GameComponent";

type ComponentMask = IndexByType<GroupDefinition>;
export default ComponentMask;

/**
 * Check if given entity contains certain components
 * @param value Entity to check against mask.
 * @param mask Mask to use. Prop value false means the component is optional.
 */
export function checkMask(value: GameEntity, mask: ComponentMask) {
    for (let key of Object.keys(mask)) {
        if (value.components[key] === undefined) {
            return false;
        }
    }
    return true;
}

/**
 * Extract matching components and arrange them in the requested shape
 * @param components Component index to check against mask.
 * @param mask Mask to use as template for checking and result shape.
 */
export function applyMask(components: IndexByType<GameComponent>, mask: ComponentMask): IndexByType<ComponentGroup> {
    const result: IndexByType<ComponentGroup> = {};
    for (let entityType of Object.getOwnPropertyNames(mask)) {
        const group: ComponentGroup = {};
        result[entityType] = group;

        const groupDefinition = mask[entityType];
        for (let componentType of Object.getOwnPropertyNames(groupDefinition)) {
            const componentDefinition = groupDefinition[componentType];
            if (components.hasOwnProperty(componentDefinition.type.name)) {
                // Set reference to value
                group[componentType] = components[componentDefinition.type.name];
            } else if (componentDefinition.required === false) {
                // Set reference to null
                group[componentType] = null;
            } else {
                // Omit entity for current entity type
                result[entityType] = null;
                break;
            }
        }
    }
    return result;
}