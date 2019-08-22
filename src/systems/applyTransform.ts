import GameSystem from "./GameSystem";
import Transform from "../components/Transform";
import Position from "../components/Position";
import { roll } from "../utilities/helpers";

export const parse: GameSystem = function (components: { position: Position[], transform: Transform[] }) {
    for (let i = 0; i < components.position.length; i++) {
        const position = components.position[i];
        const transform = components.transform[i];
        position.x += transform.x;
        position.y += transform.y;
        position.z += transform.z;
        position.rotX = roll(position.rotX + transform.rotX, 0, Math.PI * 2);
        position.rotY = roll(position.rotY + transform.rotY, 0, Math.PI * 2);
        position.rotZ = roll(position.rotZ + transform.rotZ, 0, Math.PI * 2);

        transform.x = 0;
        transform.y = 0;
        transform.z = 0;
        transform.rotX = 0;
        transform.rotY = 0;
        transform.rotZ = 0;
    }
}