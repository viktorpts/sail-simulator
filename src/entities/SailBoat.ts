import GameEntity from "./GameEntity";
import InputState from "../components/InputState";
import BoatControlState from "../components/BoatControlState";
import BoatLocomotion from "../components/BoatLocomotion";
import Position from "../components/Position";
import SailRigging from "../components/SailRigging";
import AnimationRigging from "../components/AnimationRigging";

export default class SailBoat extends GameEntity {
    init(input: InputState, control: BoatControlState, driver: BoatLocomotion, position: Position, rigging: SailRigging) {
        this.components[InputState.name] = input;
        this.components[BoatControlState.name] = control;
        this.components[BoatLocomotion.name] = driver;
        this.components[Position.name] = position;
        this.components[AnimationRigging.name] = rigging;
    }
}