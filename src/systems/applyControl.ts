import GameSystem from "./GameSystem";
import BoatControlState from "../components/BoatControlState";
import Movement from "../components/Movement";
import { STEP_RATE } from '../constants';
import { clamp } from '../utilities/helpers';

export const parse: GameSystem = function (components: { controlState: BoatControlState[], movement: Movement[] }) {
    for (let i = 0; i < components.controlState.length; i++) {
        const state = components.controlState[i];
        const movement = components.movement[i];

        // Direction
        if (state.turningLeft) {
            movement.turnRate = Math.min(movement.turnRate + movement.turnRateDelta * STEP_RATE, 1);
        } else if (state.turningRight) {
            movement.turnRate = Math.max(movement.turnRate - movement.turnRateDelta * STEP_RATE, -1);
        } else if (movement.turnRate != 0) {
            if (movement.turnRate < 0) {
                movement.turnRate = clamp(movement.turnRate + movement.turnRateDelta * STEP_RATE, -1, 0);
            } else {
                movement.turnRate = clamp(movement.turnRate - movement.turnRateDelta * STEP_RATE, 0, 1);
            }
        }

        // Movement
        if (state.accelerating) {
            movement.speed = Math.min(movement.speed + movement.acceleration * STEP_RATE, 1);
        } else if (state.decelerating) {
            movement.speed = Math.max(movement.speed - movement.acceleration * STEP_RATE, 0);
        }

        // Trim
        if (state.trimmingLeft) {
            movement.trimAngle = Math.max(movement.trimAngle - Math.PI * 0.25 * STEP_RATE, -movement.maxTrimAngle);
        } else if (state.trimmingRight) {
            movement.trimAngle = Math.min(movement.trimAngle + Math.PI * 0.25 * STEP_RATE, movement.maxTrimAngle);
        }
    }
}