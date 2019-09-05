import GameEntity from "./GameEntity";
import InputState from "../components/InputState";
import BoatControlState from "../components/BoatControlState";
import Position from "../components/Position";
import MotorLocomotion from "../components/MotorLocomotion";

export default class MotorBoat extends GameEntity {
    init(input: InputState, control: BoatControlState, driver: MotorLocomotion, position: Position) {
        this.components[InputState.name] = input;
        this.components[BoatControlState.name] = control;
        this.components[MotorLocomotion.name] = driver;
        this.components[Position.name] = position;
    }
}