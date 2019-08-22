import GameComponent from "./GameComponent";

export default class Transform extends GameComponent {
    x: number;
    y: number;
    z: number;
    rotX: number;
    rotY: number;
    rotZ: number;

    constructor(
        { x, y, z }: { x: number, y: number, z: number },
        { rotX, rotY, rotZ }: { rotX: number, rotY: number, rotZ: number },
        id: number, entityId: number
    ) {
        super(id, entityId);
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotX = rotX;
        this.rotY = rotY;
        this.rotZ = rotZ;
    }
}