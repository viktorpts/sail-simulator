import GameComponent from "../components/GameComponent";

export default class ComponentRepository {
    // storage of components
    // index of components

    // a method to retrieve components by entity ID
    // retrieved components should be grouped by entity, for ease of iterating by systems

    private data: ArrayBuffer[];
    private index: { [index: string]: number };
    // utils to manage/extend buffer sizes?

    registerComponent<T extends GameComponent>(definition: T) {
    }
}