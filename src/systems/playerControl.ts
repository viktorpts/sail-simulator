import GameSystem from "./GameSystem";
import { Input } from "../ctrlScheme";
import BoatControlState from "../components/BoatControlState";
import InputState from "../components/InputState";


export const parse: GameSystem = function (components: { controlState: BoatControlState[], inputState: InputState[] }) {
    for (let i = 0; i < components.controlState.length; i++) {
        components.controlState[i].accelerating = components.inputState[i][Input.MoreSails];
        components.controlState[i].decelerating = components.inputState[i][Input.LessSails];
        components.controlState[i].turningLeft = components.inputState[i][Input.TurnLeft];
        components.controlState[i].turningRight = components.inputState[i][Input.TurnRight];
        components.controlState[i].trimmingLeft = components.inputState[i][Input.TrimLeft];
        components.controlState[i].trimmingRight = components.inputState[i][Input.TrimRight];
    }
}