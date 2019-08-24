import { ComponentIndexByType } from "../utilities/Collections";
import GameComponent from "../components/GameComponent";

export default abstract class GameEntity {
    readonly id: number;
    readonly components: {[index: string]: GameComponent};

    constructor(id: number) {
        this.id = id;
        this.components = {};
    }

    abstract init(...components: GameComponent[]): void;
}