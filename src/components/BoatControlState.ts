import GameComponent from "./GameComponent";


export default class BoatControlState extends GameComponent {
    turningLeft = false;
    turningRight = false;
    accelerating = false;
    decelerating = false;
    trimmingLeft = false;
    trimmingRight = false;

    constructor(id: number, entityId: number) {
        super(id, entityId);
    }
}