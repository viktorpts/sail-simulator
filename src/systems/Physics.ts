import GameSystem from "./GameSystem";
import Position from "../components/Position";
import { STEP_SIZE, WORLD_WIDTH, WORLD_HEIGHT, WORLD_HSEGMENTS, WORLD_VSEGMENTS } from '../constants';
import { deltaFromAngle, roll } from '../utilities/helpers';
import TerrainCollider from "../components/TerrainCollider";
import ComponentMask from "../utilities/ComponentMask";
import BoatLocomotion from "../components/BoatLocomotion";
import { EntityIndexById } from "../utilities/Collections";
import Wind from "../components/Wind";

const drag = 0.5;

export default class Physics implements GameSystem {
    readonly mask: ComponentMask = {
        bodies: {
            driver: {
                type: BoatLocomotion,
                required: true
            },
            position: {
                type: Position,
                required: true
            }
        },
        terrain: {
            collider: {
                type: TerrainCollider,
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
        bodies: EntityIndexById<{ driver: BoatLocomotion, position: Position }>,
        terrain: EntityIndexById<{ collider: TerrainCollider }>,
        environment: EntityIndexById<{ wind: Wind }>
    }) {
        const terrain = [...entities.terrain][0].collider
        const wind = [...entities.environment][0].wind;
        for (let body of entities.bodies) {
            applyWind(body.driver, body.position, wind);
            applyDriver(body.driver, body.position, terrain);
        }
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

function applyDriver(driver: BoatLocomotion, position: Position, terrain: TerrainCollider) {
    const speedFraction = driver.forces.forward / driver.limits.forward;
    //const speedFraction = 1; // Debug option to rotate boat freely while stationary (will fail tests if left)

    // Direction
    if (driver.forces.heading != 0) {
        position.heading = roll(position.heading + driver.forces.heading * STEP_SIZE * Math.max(speedFraction, 0.1), 0, Math.PI * 2);
    }

    // Position
    if (driver.forces.forward != 0) {
        const { x: deltaX, y: deltaY } = deltaFromAngle({ distance: driver.forces.forward * STEP_SIZE, angle: position.heading });
        const newPos = {
            x: position.x + deltaX,
            y: position.y + deltaY
        };

        const validX = !checkCollision(newPos.x, position.y, terrain.heighMap);
        const validY = !checkCollision(position.x, newPos.y, terrain.heighMap);
        if (validX) {
            position.x += deltaX;
        }
        if (validY) {
            position.y += deltaY;
        }

        // Drag due ot water resistance
        driver.forces.forward = Math.max(driver.forces.forward - (driver.limits.forward * 0.05 + (speedFraction ** 2)) * drag * STEP_SIZE, 0);
    }
}

function checkCollision(x: number, y: number, heightMap: Int16Array): boolean {
    const mapX = Math.round(WORLD_HSEGMENTS * 0.5 - 0.5 + (x / WORLD_WIDTH * WORLD_HSEGMENTS));
    const mapY = Math.round(WORLD_VSEGMENTS * 0.5 - 0.5 - (y / WORLD_HEIGHT * WORLD_VSEGMENTS));
    if (heightMap[mapX + mapY * WORLD_HSEGMENTS] >= 76) {
        return true;
    } else {
        return false;
    }
}