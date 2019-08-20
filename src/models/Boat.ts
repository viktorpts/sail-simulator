import { makeBoat, makeMainsail, makeHeadsail } from './modelMaker';
import { deltaFromAngle, print } from '../util';
import * as THREE from 'three';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../constants';


const minTurnRate = Math.PI / 2000;
const turnRateDelta = Math.PI / 30;
const maxSpeed = 2;


export default class Boat {
    private _mesh: THREE.Group;
    private _speed: number = 0;
    private mainsail: THREE.Mesh;
    private headsail: THREE.Mesh;
    private heighMap: Int16Array;
    private lastMap = { x: 0, y: 0 };
    private world: { width: number, height: number }
    private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    private heading: number = 0;

    constructor(heightMap: Int16Array, worldWidth: number, worldHeight: number) {
        const hull = makeBoat(0x917833).mesh;
        this.mainsail = makeMainsail().mesh;
        this.mainsail.position.z = 1;
        this.headsail = makeHeadsail().mesh;
        this.headsail.position.z = 1;
        this.headsail.position.y = 6.5;
        this.headsail.rotation.x = - Math.PI / 6;
        this._mesh = new THREE.Group();
        this._mesh.add(hull, this.mainsail, this.headsail);
        this._mesh.rotation.y = this.heading + Math.PI;

        this.heighMap = heightMap;
        this.world = { width: worldWidth, height: worldHeight };
    }

    update(time: number) {
        if (this._speed != 0) {
            const { x: deltaX, z: deltaZ } = deltaFromAngle({ distance: this._speed, angle: this.heading + Math.PI });
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
            this._speed -= 0.0002 + ((this._speed / 0.15) ** 2) * 0.001;
            if (this._speed < 0) {
                this._speed = 0;
            }
        }


        this._mesh.rotation.z = Math.sin(time) / 10 + this.mainsail.rotation.y * 0.25 * this._speed / 0.15;
        this._mesh.position.y = (Math.sin(time * 2 / 3) / 10) - 0.3;

        print(`Heading: ${this.heading}`);
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
        return this._speed / 0.15;
    }

    turnLeft() {
        this.heading += minTurnRate + this._speed * turnRateDelta;
        if (this.heading > Math.PI * 2) {
            this.heading = this.heading - Math.PI * 2;
        }
        this._mesh.rotation.y = this.heading + Math.PI;
    }

    turnRight() {
        this.heading -= minTurnRate + this._speed * turnRateDelta;
        if (this.heading < 0) {
            this.heading = Math.PI * 2 - this.heading;
        }
        this._mesh.rotation.y = this.heading + Math.PI;
    }

    trimLeft() {
        this.mainsail.rotation.y += Math.PI / 200;
        this.headsail.rotation.y += Math.PI / 200;
    }

    trimRight() {
        this.mainsail.rotation.y -= Math.PI / 200;
        this.headsail.rotation.y -= Math.PI / 200;
    }

    accelerate() {
        this._speed += 0.002;
        if (this._speed > 0.15) {
            this._speed = 0.15;
        }
    }

    decelerate() {
        this._speed -= 0.002;
        if (this._speed < 0) {
            this._speed = 0;
        }
    }
}