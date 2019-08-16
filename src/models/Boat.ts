import { makeBoat, makeSails } from './modelMaker';
import { deltaFromAngle } from '../util';
import * as THREE from 'three';


const minTurnRate = Math.PI / 2000;
const turnRateDelta = Math.PI / 30;
const maxSpeed = 2;


export default class Boat {
    private group: THREE.Group;
    private body: THREE.Mesh;
    private sails: THREE.Mesh;
    private _speed: number = 0;

    constructor() {
        this.body = makeBoat(0x917833).mesh;
        this.sails = makeSails().mesh;
        this.group = new THREE.Group();
        this.group.add(this.body, this.sails);
    }

    update(time: number) {
        if (this._speed != 0) {
            const { x: deltaX, z: deltaZ } = deltaFromAngle({ distance: this._speed, angle: this.group.rotation.y });
            this.group.position.x += deltaX;
            this.group.position.z += deltaZ;

            this._speed -= 0.0002 + ((this._speed / 0.15)**2)*0.001;
            if (this._speed < 0) {
                this._speed = 0;
            }
        }

        this.group.rotation.z = Math.sin(time) / 10;
        this.group.position.y = (Math.sin(time * 2 / 3) / 10) - 0.3;

        /*
        this.sailMesh.position.x = this.bodyMesh.position.x;
        this.sailMesh.position.y = this.bodyMesh.position.y;
        this.sailMesh.position.z = this.bodyMesh.position.z;
        this.sailMesh.rotation.x = this.bodyMesh.rotation.x;
        this.sailMesh.rotation.y = this.bodyMesh.rotation.y;
        this.sailMesh.rotation.z = this.bodyMesh.rotation.z;
        */
    }

    get mesh() {
        return this.group;
    }

    get bodyMesh() {
        return this.body;
    }

    get sailMesh() {
        return this.sails;
    }

    get speed() {
        return this._speed / 0.15;
    }

    turnLeft() {
        this.group.rotation.y += minTurnRate + this._speed * turnRateDelta;
    }

    turnRight() {
        this.group.rotation.y -= minTurnRate + this._speed * turnRateDelta;
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