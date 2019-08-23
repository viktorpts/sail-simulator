import ComponentMask from "./ComponentMask";
import GameEntity from "../entities/GameEntity";
import GameComponent from "../components/GameComponent";

export interface ComponentIndex {
    // TODO: implement TypedArray wrapper with the following functionality
    // Iterate over elements (Symbol.Iterator)
    // Iterate with applied filter of entity IDs
    // Access individual element by index/ID
    // Component collections as properties
    [index: string]: number;
}

export interface ComponentBlock {
    [index: number]: GameComponent;
}

export interface ComponentGroup {
    [index: number]: number[];
    push (item: number[]): void;
}

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