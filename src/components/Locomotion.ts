import GameComponent from "./GameComponent";
import Force from "./Force";
import ForceLimit from "./ForceLimit";
import ForceRate from "./ForceRate";

export default class Locomotion extends GameComponent {
    rates: ForceRate;
    forces: Force;
    limits: ForceLimit;
}