import GameEntity from "./GameEntity";
import Wind from '../components/Wind';
import InputState from "../components/InputState";

export default class Environment extends GameEntity {
    init(wind: Wind, input: InputState) {
        this.components[Wind.name] = wind;
        this.components[InputState.name] = input;
    }
}