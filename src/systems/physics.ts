import GameSystem from "./GameSystem";
import Movement from "../components/Movement";
import Transform from "../components/Transform";
import Position from "../components/Position";
import BoatControlState from "../components/BoatControlState";
import { STEP_RATE, WORLD_WIDTH, WORLD_HEIGHT, WORLD_HSEGMENTS, WORLD_VSEGMENTS } from '../constants';
import { deltaFromAngle } from '../utilities/helpers';
import TerrainCollider from "../components/TerrainCollider";
import ComponentMask from "../utilities/ComponentMask";
import Force from "../components/Force";

export default class Physics implements GameSystem {
    readonly mask: ComponentMask = {
        bodies: {
            transform: {
                type: Transform,
                required: true
            },
            force: {
                type: Force,
                required: true
            }
        },
        terrain: {
            collider: {
                type: TerrainCollider,
                required: true
            }
        }
    }

    parse() {

    }
}

export const parse = function (components: { movement: Movement[], transform: Transform[], position: Position[], controlState: BoatControlState[], terrain: TerrainCollider[] }) {
    for (let i = 0; i < components.movement.length; i++) {
        const movement = components.movement[i];
        const transform = components.transform[i];
        const position = components.position[i];
        const state = components.controlState[i];
        const terrain = components.terrain[i];

        // Direction
        if (movement.turnRate != 0) {
            transform.rotY += movement.turnRate * movement.maxTurnRate * STEP_RATE * movement.speed;
            // Animation/rendering system
            // this._mesh.rotation.y = this._direction;
        }

        // Drag due ot water resistance
        if (!state.accelerating && !state.decelerating) {
            movement.speed = Math.max(movement.speed - (movement.maxSpeed * 0.05 + (movement.speed ** 2)) * movement.drag * STEP_RATE, 0);
        }

        // Position
        if (movement.speed != 0) {
            const { x: deltaX, z: deltaZ } = deltaFromAngle({ distance: movement.speed * movement.maxSpeed * STEP_RATE, angle: position.rotY + transform.rotY });
            const newPos = {
                x: position.x + transform.x + deltaX,
                z: position.z + transform.z + deltaZ
            };
            const worldX = Math.round(newPos.x);
            const worldZ = Math.round(newPos.z);

            if (checkCollision(newPos.x, newPos.z, terrain.heighMap)) {
                //this.updateMap(worldX, worldZ, '#f00');
            } else {
                //this.updateMap(worldX, worldZ, '#fff');
                transform.x += deltaX;
                transform.z += deltaZ;
            }
        }
    }
}

function checkCollision(x: number, y: number, heightMap: Int16Array): boolean {
    // TODO: add check for direction of collision, to allow sliding along edges of terrain
    const mapX = Math.round(WORLD_HSEGMENTS * 0.5 - 0.5 + (x / WORLD_WIDTH * WORLD_HSEGMENTS));
    const mapY = Math.round(WORLD_VSEGMENTS * 0.5 - 0.5 + (y / WORLD_HEIGHT * WORLD_VSEGMENTS));
    if (heightMap[mapX + mapY * WORLD_HSEGMENTS] >= 76) {
        return true;
    } else {
        return false;
    }
}