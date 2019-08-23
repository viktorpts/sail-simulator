import { ComponentIndex } from "../utilities/ComponentCollections";

export default class GameEntity {
    id: number;
    components: ComponentIndex;

    constructor(id: number) {
        this.id = id;
        this.components = {};
    }
}