import { makeBoat, makeRudder, makeMainsail, makeHeadsail } from './modelMaker';
import * as THREE from 'three';


export default class Boat {
    private _mesh: THREE.Group;
    private _mainsail: THREE.Mesh;
    private _headsail: THREE.Mesh;
    private _rudder: THREE.Mesh;

    constructor() {
        const hull = makeBoat(0x917833).mesh;
        this._rudder = makeRudder(0x917833).mesh;
        this._rudder.position.y = 1;
        this._rudder.position.z = -2.75;
        this._mainsail = makeMainsail().mesh;
        this._mainsail.position.z = 1;
        this._mainsail.position.y = 1.5;
        this._headsail = makeHeadsail().mesh;
        this._headsail.position.z = 1;
        this._headsail.position.y = 6.5;
        this._headsail.rotation.x = - Math.PI / 6;
        this._mesh = new THREE.Group();
        this._mesh.add(hull, this._rudder, this._mainsail, this._headsail);
    }

    get mesh() {
        return this._mesh;
    }

    get rudder() {
        return this._rudder;
    }

    get mainsail() {
        return this._mainsail;
    }

    get headsail() {
        return this._headsail;
    }
}