import GameComponent from "./GameComponent";

export default class Movement extends GameComponent {
    turnRateDelta = 2;
    maxTurnRate = Math.PI * 0.25;
    acceleration = 0.4;
    maxSpeed = 10;
    turnRate = 0;
    speed = 0;
    drag = 0.05;
    trimAngle = 0;
    maxTrimAngle = Math.PI * 0.3;

    constructor(id: number, entityId: number) {
        super(id, entityId);
    }
}