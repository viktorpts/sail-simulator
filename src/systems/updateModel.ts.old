import GameSystem from "./GameSystem";
import Model from "../components/Model";
import Position from "../components/Position";

export const parse: GameSystem = function (components: { position: Position[], model: Model[] }) {
    for (let i = 0; i < components.position.length; i++) {
        const position = components.position[i];
        const model = components.model[i];

        model.model.position.x = position.x;
        model.model.position.y = position.y;
        model.model.position.z = position.z;
        model.model.rotation.x = position.rotX;
        model.model.rotation.y = position.rotY;
        model.model.rotation.z = position.rotZ;
    }
}