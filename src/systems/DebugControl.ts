import GameSystem from "./GameSystem";
import { Input } from "../ctrlScheme";
import InputState from "../components/InputState";
import ComponentMask from "../utilities/ComponentMask";
import { EntityIndexById } from "../utilities/Collections";
import Wind from "../components/Wind";
import { wrap } from "../utilities/helpers";

export default class DebugControl implements GameSystem {
    readonly mask: ComponentMask = {
        env: {
            input: {
                type: InputState,
                required: true
            },
            wind: {
                type: Wind,
                required: true
            }
        }
    }

    parse(
        entities: {
            env: EntityIndexById<{
                input: InputState,
                wind: Wind
            }>
        }
    ) {
        for (let env of entities.env) {
            if (env.input[Input.Up]) {
                env.wind.windSpeed += 0.1;
            } else if (env.input[Input.Down]) {
                env.wind.windSpeed -= 0.1;
            }
            if (env.input[Input.Left]) {
                env.wind.windHeading = wrap(env.wind.windHeading - Math.PI * 0.01, 0, Math.PI * 2);
            } else if (env.input[Input.Right]) {
                env.wind.windHeading = wrap(env.wind.windHeading + Math.PI * 0.01, 0, Math.PI * 2);
            }
        }
    }
}