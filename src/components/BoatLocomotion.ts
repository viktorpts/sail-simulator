import Locomotion from "./Locomotion";

export default class BoatLocomotion extends Locomotion {
    effSailArea: number;
    trimAngle: number;
    trimRate: number;
    maxTrimAngle: number;
    AoA: number;
    localWind: {x: number, y: number} = {x: 0, y: 0};
    sailForce: {x: number, y: number} = {x: 0, y: 0};
    lift: number;
    drag: number;
}