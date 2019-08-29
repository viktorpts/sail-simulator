import GameSystem from "./GameSystem";
import { Input } from "../ctrlScheme";
import BoatControlState from "../components/BoatControlState";
import InputState from "../components/InputState";
import ComponentMask from "../utilities/ComponentMask";
import GameComponent from "../components/GameComponent";
import { EntityIndexById } from "../utilities/Collections";

export default class PlayerControl implements GameSystem {
    readonly mask: ComponentMask = {
        actors: {
            input: {
                type: InputState,
                required: true
            },
            control: {
                type: BoatControlState,
                required: true
            }
        }
    }

    parse(
        entities: {
            actors: EntityIndexById<{
                input: InputState,
                control: BoatControlState
            }>
        }
    ) {
        for (let actor of entities.actors) {
            actor.control.accelerating = actor.input[Input.MoreSails];
            actor.control.decelerating = actor.input[Input.LessSails];
            actor.control.turningLeft = actor.input[Input.TurnLeft];
            actor.control.turningRight = actor.input[Input.TurnRight];
            actor.control.trimmingLeft = actor.input[Input.TrimLeft];
            actor.control.trimmingRight = actor.input[Input.TrimRight];
        }
    }
}