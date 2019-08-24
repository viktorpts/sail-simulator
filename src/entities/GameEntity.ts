import GameComponent from "../components/GameComponent";
import { IndexByType } from "../utilities/Collections";

export default abstract class GameEntity {
    readonly id: number;
    readonly components: IndexByType<GameComponent>;

    constructor(id: number) {
        this.id = id;
        this.components = {};
    }

    abstract init(...components: GameComponent[]): void;
}