import GameComponent from "./GameComponent";
import Position from "./Position";

export default class Follower extends GameComponent {
    target: Position;
    matchDirection = false;
    matchElevation = false;

    constructor(target: Position, id: number, entityId: number) {
        super(id, entityId);
        this.target = target;
    }
}