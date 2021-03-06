import GameComponent from "../components/GameComponent";


export interface ComponentIndexByType {
    [index: string]: ArrayId;
};

export interface ComponentIndex {
    [index: string]: [ArrayId, ItemId];
};

export interface ComponentArray<T extends GameComponent> extends Array<T> { };

//export interface ComponentGroup extends Array<number[]> {};

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

export type GroupDefinition = {
    // Component type
    [index: string]: ComponentDefinition
}

type ComponentConstructor = Function & { prototype: GameComponent };

export type ComponentDefinition = {
    type: ComponentConstructor;
    required: boolean
}

export type IndexByType<T> = {
    [index: string]: T
}

export type IndexById<T> = {
    [index: string]: T
}

export class EntityIndexById<T> implements Iterable<T> {
    [index: string]: T;

    constructor();
    constructor(index: { [index: string]: T });
    constructor(index?: { [index: string]: T }) {
        if (index !== undefined) {
            for (let name of Object.getOwnPropertyNames(index)) {
                this[name] = index[name];
            }
        }
    }

    [Symbol.iterator](): Iterator<T> {
        const names = Object.getOwnPropertyNames(this);
        let index = 0;
        return {
            next: () => {
                if (index >= names.length) {
                    return {
                        value: null,
                        done: true
                    };
                } else {
                    const value: T = this[names[index]];
                    index++;
                    return {
                        value,
                        done: false
                    }
                }
            }
        }
    }
}