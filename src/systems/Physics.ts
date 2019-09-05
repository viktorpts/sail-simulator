import GameSystem from "./GameSystem";
import Position from "../components/Position";
import { STEP_SIZE, WORLD_WIDTH, WORLD_HEIGHT, WORLD_HSEGMENTS, WORLD_VSEGMENTS } from '../constants';
import { deltaFromAngle, wrap } from '../utilities/helpers';
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
            applyDriver(body.driver, body.position, terrain);
        }
    }
}

function applyDriver(driver: BoatLocomotion, position: Position, terrain: TerrainCollider) {
    const speedFraction = driver.forces.forward / driver.limits.forward;
    //const speedFraction = 1; // Debug option to rotate boat freely while stationary (will fail tests if left)

    // Direction
    if (driver.forces.heading != 0) {
        position.heading = wrap(position.heading + driver.forces.heading * STEP_SIZE * Math.max(speedFraction, 0.1), 0, Math.PI * 2);
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