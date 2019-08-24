import ComponentMask from "./ComponentMask";
import GameEntity from "../entities/GameEntity";
import GameComponent from "../components/GameComponent";

export interface ComponentIndexByType {
    [index: string]: ArrayId;
};

export interface ComponentIndex {
    [index: string]: [ArrayId, ItemId];
};

export interface ComponentArray<T extends GameComponent> extends Array<T> {};

//export interface ComponentGroup extends Array<number[]> {};

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

type ArrayId = number;
type ItemId = number;


export type IndexByTypeAndId<T> = {
    [index: string]: {      // Type
        [index: string]: T  // Id
    }
}

export type ComponentGroup = {
    // Component type
    [index: string]: GameComponent
}

export type ComponentDefinition = {
    type: new (...args: any[]) => GameComponent;
    required: boolean
}

export type IndexByType<T> = {
    [index: string]: T
}

export type IndexById<T> = {
    [index: string]: T
}