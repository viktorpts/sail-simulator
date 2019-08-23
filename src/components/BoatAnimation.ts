import GameComponent from "./GameComponent";
import Boat from "../entities/Boat";

export default class BoatAnimation extends GameComponent {
    model: Boat;
    tick: number = 0;
    
    constructor(model: Boat, id: number, entityId: number) {
        super(id, entityId);
        this.model = model;
    }
}