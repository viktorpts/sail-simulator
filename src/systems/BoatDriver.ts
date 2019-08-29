import GameSystem from "./GameSystem";
import ComponentMask from "../utilities/ComponentMask";
import BoatControlState from "../components/BoatControlState";
import { EntityIndexById } from "../utilities/Collections";
import { STEP_SIZE } from "../constants";
import { clamp } from "../utilities/helpers";
import BoatLocomotion from "../components/BoatLocomotion";

export default class BoatDriver implements GameSystem {
    readonly mask: ComponentMask = {
        boats: {
            control: {
                type: BoatControlState,
                required: true
            },
            driver: {
                type: BoatLocomotion,
                required: true
            }
        }
    }

    parse(entities: {
        boats: EntityIndexById<{
            control: BoatControlState,
            driver: BoatLocomotion
        }>
    }) {
        for (let boat of entities.boats) {
            applyControl(boat.control, boat.driver);
        }
    }
}

function applyControl(control: BoatControlState, driver: BoatLocomotion) {
    // Direction
    if (control.turningLeft) {
        driver.forces.heading = Math.max(driver.forces.heading - driver.rates.heading * STEP_SIZE, -driver.limits.heading);
    } else if (control.turningRight) {
        driver.forces.heading = Math.min(driver.forces.heading + driver.rates.heading * STEP_SIZE, driver.limits.heading);
    } else if (driver.forces.heading != 0) {
        if (driver.forces.heading < 0) {
            driver.forces.heading = clamp(driver.forces.heading + driver.rates.heading * STEP_SIZE, -driver.limits.heading, 0);
        } else {
            driver.forces.heading = clamp(driver.forces.heading - driver.rates.heading * STEP_SIZE, 0, driver.limits.heading);
        }
    }
    
    // Movement
    if (control.accelerating) {
        driver.forces.forward = Math.min(driver.forces.forward + driver.rates.forward * STEP_SIZE, driver.limits.forward);
    } else if (control.decelerating) {
        driver.forces.forward = Math.max(driver.forces.forward - driver.rates.forward * STEP_SIZE, 0);
    }

    // Trim
    if (control.trimmingLeft) {
        driver.trimAngle = Math.min(driver.trimAngle + driver.trimRate * STEP_SIZE, driver.maxTrimAngle);
    } else if (control.trimmingRight) {
        driver.trimAngle = Math.max(driver.trimAngle - driver.trimRate * STEP_SIZE, -driver.maxTrimAngle);
    }
}