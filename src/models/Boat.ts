import { makeBoat, makeRudder, makeMainsail, makeHeadsail } from './modelMaker';
import { deltaFromAngle, print } from '../util';
import * as THREE from 'three';
import { WORLD_WIDTH, WORLD_HEIGHT, STEP_SIZE, STEP_RATE } from '../constants';


const turnRateDelta = 2;
const maxRudderAngle = Math.PI * 0.25;
const turnRate = Math.PI * 0.25;
const acceleration = 0.4;
const maxSpeed = 10;
const drag = 0.05;


export default class Boat {
    private _mesh: THREE.Group;
    private _speed: number = 0;
    private mainsail: THREE.Mesh;
    private headsail: THREE.Mesh;
    private rudder: THREE.Mesh;
    private heighMap: Int16Array;
    private lastMap = { x: 0, y: 0 };
    private world: { width: number, height: number }
    private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    private _direction: number = 0;
    private turnRate: number = 0;
    private turningLeft = false;
    private turningRight = false;
    private accelerating = false;
    private decelerating = false;

    constructor(heightMap: Int16Array, worldWidth: number, worldHeight: number) {
        const hull = makeBoat(0x917833).mesh;
        this.rudder = makeRudder(0x917833).mesh;
        this.rudder.position.y = 1;
        this.rudder.position.z = -2.75;
        this.mainsail = makeMainsail().mesh;
        this.mainsail.position.z = 1;
        this.mainsail.position.y = 1.5;
        this.headsail = makeHeadsail().mesh;
        this.headsail.position.z = 1;
        this.headsail.position.y = 6.5;
        this.headsail.rotation.x = - Math.PI / 6;
        this._mesh = new THREE.Group();
        this._mesh.add(hull, this.rudder, this.mainsail, this.headsail);
        this._mesh.rotation.y = this._direction;

        this.heighMap = heightMap;
        this.world = { width: worldWidth, height: worldHeight };
    }

    update(time: number) {
        this.updateDirection();
        this.updateMovement();
        this.updateSails();
        this.updateIdle(time);

        print(`Heading: ${(this.heading / Math.PI * 180).toFixed(0)}\nSpeed: ${(this._speed * maxSpeed).toFixed(1)} knots (${(this._speed * 100).toFixed(0)}%)`);
    }

    private updateDirection() {
        if (this.turningLeft) {
            this.turnRate += turnRateDelta * STEP_RATE;
            if (this.turnRate > 1) {
                this.turnRate = 1;
            }
        } else if (this.turningRight) {
            this.turnRate -= turnRateDelta * STEP_RATE;
            if (this.turnRate < -1) {
                this.turnRate = -1;
            }
        } else if (this.turnRate != 0) {
            if (this.turnRate < 0) {
                this.turnRate += turnRateDelta * STEP_RATE;
                if (this.turnRate > 0) {
                    this.turnRate = 0;
                }
            } else {
                this.turnRate -= turnRateDelta * STEP_RATE;
                if (this.turnRate < 0) {
                    this.turnRate = 0;
                }
            }
        }
        this.rudder.rotation.y = -1 * this.turnRate * maxRudderAngle;

        if (this.turnRate != 0) {
            this._direction += this.turnRate * turnRate * STEP_RATE * this._speed;
            if (this._direction > Math.PI * 2) {
                this._direction = this._direction - Math.PI * 2;
            } else if (this._direction < 0) {
                this._direction = Math.PI * 2 + this._direction;
            }
            this._mesh.rotation.y = this._direction;
        }
    }

    private updateMovement() {
        if (this.accelerating) {
            this._speed += acceleration * STEP_RATE;
            if (this._speed > 1) {
                this._speed = 1;
            }
        } else if (this.decelerating) {
            this._speed -= acceleration * STEP_RATE;
            if (this._speed < 0) {
                this._speed = 0;
            }
        } else {
            this._speed -= (maxSpeed * 0.05 + (this._speed ** 2)) * drag * STEP_RATE;
            if (this._speed < 0) {
                this._speed = 0;
            }
        }

        if (this._speed != 0) {
            const { x: deltaX, z: deltaZ } = deltaFromAngle({ distance: this._speed * maxSpeed * STEP_RATE, angle: this._direction });
            const newPos = {
                x: this._mesh.position.x + deltaX,
                z: this._mesh.position.z + deltaZ
            };
            const worldX = Math.round(newPos.x);
            const worldZ = Math.round(newPos.z);

            if (this.checkCollision(newPos.x, newPos.z)) {
                this.updateMap(worldX, worldZ, '#f00');
            } else {
                this.updateMap(worldX, worldZ, '#fff');
                this._mesh.position.x = newPos.x;
                this._mesh.position.z = newPos.z;
            }
        }
    }

    private updateIdle(time: number) {
        this._mesh.rotation.z = Math.sin(time) / 10 + (Math.PI / 3 - Math.abs(this.mainsail.rotation.y)) * 0.4 * this._speed * (this.mainsail.rotation.y < 0 ? -1 : 1);
        this._mesh.position.y = (Math.sin(time * 2 / 3) / 10) - 0.3;
    }

    get heading() {
        const _heading = this._direction + Math.PI;
        if (_heading > Math.PI * 2) {
            return _heading - Math.PI * 2
        } else {
            return _heading;
        }
    }

    private checkCollision(x: number, y: number): boolean {
        const mapX = Math.round(this.world.width * 0.5 - 0.5 + (x / WORLD_WIDTH * this.world.width));
        const mapY = Math.round(this.world.height * 0.5 - 0.5 + (y / WORLD_HEIGHT * this.world.height));
        if (this.heighMap[mapX + mapY * this.world.width] >= 76) {
            return true;
        } else {
            return false;
        }
    }

    private updateMap(x: number, y: number, color: string) {
        if (x != this.lastMap.x || y != this.lastMap.y) {
            this.lastMap.x = x;
            this.lastMap.y = y;
            const mapX = Math.round(this.world.width * 0.5 - 0.5 + (x / WORLD_WIDTH * this.world.width));
            const mapY = Math.round(this.world.height * 0.5 - 0.5 + (y / WORLD_HEIGHT * this.world.height));
            const ctx = (<HTMLCanvasElement>document.getElementById('map')).getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(mapX, mapY, 1, 1);
        }
    }

    get mesh() {
        return this._mesh;
    }

    get speed() {
        return this._speed;
    }

    turnLeft() {
        this.turningLeft = true;
    }

    turnRight() {
        this.turningRight = true;
    }

    rudderStraight() {
        this.turningLeft = false;
        this.turningRight = false;
    }

    trimLeft() {
        this.mainsail.rotation.y -= Math.PI / 200;
        this.headsail.rotation.y -= Math.PI / 200;
    }

    trimRight() {
        this.mainsail.rotation.y += Math.PI / 200;
        this.headsail.rotation.y += Math.PI / 200;
    }

    private updateSails() {
        const multiplier = this.mainsail.rotation.y < 0 ? -1 : 1;
        this.mainsail.scale.x = this._speed * multiplier || 0.001;
        this.headsail.scale.x = this._speed * multiplier || 0.001;
    }

    accelerate() {
        this.accelerating = true;
    }

    decelerate() {
        this.decelerating = true;
    }

    letGo() {
        this.accelerating = false;
        this.decelerating = false;
    }
}