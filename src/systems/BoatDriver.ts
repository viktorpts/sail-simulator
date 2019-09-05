import GameSystem from "./GameSystem";
import ComponentMask from "../utilities/ComponentMask";
import BoatControlState from "../components/BoatControlState";
import { EntityIndexById } from "../utilities/Collections";
import { STEP_SIZE } from "../constants";
import { clamp } from "../utilities/helpers";
import BoatLocomotion from "../components/BoatLocomotion";
import Position from "../components/Position";
import Wind from "../components/Wind";

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
            },
            position: {
                type: Position,
                required: true
            }
        },
        environment: {
            wind: {
                type: Wind,
                required: true
            }
        }
    }

    parse(entities: {
        boats: EntityIndexById<{
            control: BoatControlState,
            driver: BoatLocomotion,
            position: Position
        }>,
        environment: EntityIndexById<{ wind: Wind }>
    }) {
        const wind = [...entities.environment][0].wind;
        for (let boat of entities.boats) {
            applyControl(boat.control, boat.driver);
            applyWind(boat.driver, boat.position, wind);
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

function applyWind(driver: BoatLocomotion, position: Position, wind: Wind) {
    // Local space conversion and calculations
    const windVector = { x: Math.sin(wind.windHeading - position.heading) * wind.windSpeed, y: Math.cos(wind.windHeading - position.heading) * wind.windSpeed };
    const apparentWindVector = { x: windVector.x, y: windVector.y - driver.forces.forward };
    const sailVector = { x: Math.sin(driver.trimAngle + Math.PI), y: Math.cos(driver.trimAngle + Math.PI) };
    const cross = sailVector.x * apparentWindVector.y - sailVector.y * apparentWindVector.x;
    const dot = sailVector.x * apparentWindVector.x + sailVector.y * apparentWindVector.y;
    driver.AoA = Math.acos(dot / (Math.sqrt(sailVector.x ** 2 + sailVector.y ** 2) * Math.sqrt(apparentWindVector.x ** 2 + apparentWindVector.y ** 2))) * Math.sign(cross);

    driver.localWind.x = apparentWindVector.x;
    driver.localWind.y = apparentWindVector.y;

    if (windInSail(driver.AoA, driver.trimAngle) === false) {
        driver.lift = 0;
        driver.drag = 0;
        driver.sailForce = { x: 0, y: 0 };
    } else {
        // Based on AoA
        const a = 2 * (Math.PI * 0.5 - Math.abs(Math.PI * 0.5 - Math.abs(driver.AoA))) / Math.PI;
        const b = Math.sqrt(2 * Math.abs(driver.AoA) / Math.PI);
        const dragCoef = a ** 2;
        const liftCoef = Math.abs(driver.AoA) * 2 > Math.PI ? 0 : b * (b - 1) * (b ** 2 - 1) * 4.8;

        // Based on sail area
        const dragRatio = dragCoef * driver.effSailArea;
        const liftRatio = liftCoef * driver.effSailArea;

        // Based on wind speed
        driver.drag = dragRatio * wind.windSpeed;
        driver.lift = liftRatio * wind.windSpeed;

        // Use sail vector to decompose lift and drag into forward and lateral forces on the boat
        const force = driver.drag + driver.lift;
        driver.sailForce = { x: force * sailVector.y * Math.sign(driver.trimAngle), y: -(force * sailVector.x * Math.sign(driver.trimAngle)) };

        // Forward force
        driver.forces.forward = Math.min(driver.forces.forward + driver.sailForce.y * STEP_SIZE, driver.limits.forward);
    }

    function windInSail(AoA: number, trimAngle: number) {
        return Math.sign(AoA * trimAngle) <= 0 ? true : false;
    }
}