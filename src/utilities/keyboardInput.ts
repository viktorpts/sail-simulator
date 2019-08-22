import InputState from "../components/InputState";
import { Input } from "../ctrlScheme";

export function initialize(state: InputState) {
    document.addEventListener('keydown', (e) => state[e.code as Input] = true);
    document.addEventListener('keyup', (e) => state[e.code as Input] = false);
}