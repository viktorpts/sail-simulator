import GameEntity from "./GameEntity";
import Position from "../components/Position";

export default class Arrow extends GameEntity {
    init(position: Position) {
        this.components[Position.name] = position;
    }
}