import Locomotion from "./Locomotion";

export default class BoatLocomotion extends Locomotion {
    trimAngle: number;
    trimRate: number;
    maxTrimAngle: number;
    AoA: number;
    dot: number;
    cross: number;
}