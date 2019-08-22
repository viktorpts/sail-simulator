import GameSystem from "./GameSystem";
import BoatAnimation from "../components/BoatAnimation";
import { STEP_SIZE } from "../constants";
import Movement from "../components/Movement";

export const parse: GameSystem = function (components: { model: BoatAnimation[], movement: Movement[] }) {
    for (let i = 0; i < components.model.length; i++) {
        const model = components.model[i];
        const movement = components.movement[i];
        model.tick += STEP_SIZE;

        model.model.mainsail.rotation.y = movement.trimAngle;
        model.model.headsail.rotation.y = 1.2 * movement.trimAngle;

        model.model.mesh.rotation.z = Math.sin(model.tick * 0.001) / 10 + (Math.PI / 3 - Math.abs(model.model.mainsail.rotation.y)) * 0.4 * movement.speed * (model.model.mainsail.rotation.y < 0 ? -1 : 1);
        model.model.mesh.position.y = (Math.sin(model.tick * 0.001 * 2 / 3) / 10) - 0.3;

        model.model.rudder.rotation.y = -1 * movement.turnRate * Math.PI * 0.25;

        const multiplier = model.model.mainsail.rotation.y < 0 ? -1 : 1;
        model.model.mainsail.scale.x = movement.speed * multiplier || 0.001;
        model.model.headsail.scale.x = movement.speed * multiplier || 0.001;
    }
}