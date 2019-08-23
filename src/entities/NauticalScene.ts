import { Scene, Color, AmbientLight, Mesh } from 'three';
import { makeCompass, makeTerrain, makeWaves, makeSea } from './modelMaker';
import Boat from './Boat';
import { WORLD_HSEGMENTS, WORLD_VSEGMENTS } from '../constants';
import { generateHeight } from '../util';
import TrackingCamera from './TrackingCamera';
import NauticalSun from "./NauticalSun";


export default class NauticalScene extends Scene {
    private _camera: TrackingCamera;
    private _actor: Boat;
    private waves: { mesh: Mesh, update: Function, getOffset: Function };
    private sun: NauticalSun;
    private _heightMap: Int16Array;

    constructor() {
        super();
        this.background = new Color(0xaaccff);
        const ambient = new AmbientLight(0x555555);
        this.add(ambient);
        this.sun = new NauticalSun();
        this.add(this.sun, this.sun.target);

        this.add(makeCompass());

        const z = 152;
        this._heightMap = generateHeight(WORLD_HSEGMENTS, WORLD_VSEGMENTS, z);
        const terrain = makeTerrain(this._heightMap, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
        const boat = new Boat();
        this._actor = boat;
        this.waves = makeWaves();
        const sea = makeSea(this._heightMap, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
        this.add(boat.mesh);
        this.add(terrain);
        this.add(sea);
        for (let x = -10; x < 10; x++) {
            for (let y = -10; y < 10; y++) {
                this.add(this.waves.getOffset(x, y));
            }
        }

        this._camera = new TrackingCamera(boat.mesh);
    }

    get camera() {
        return this._camera;
    }

    get actor() {
        return this._actor;
    }

    get heightMap() {
        return this._heightMap
    }

    step(time: number) {
        this.waves.update(time);
        //this.actor.update(time);

        this.sun.target.position.x = this.actor.mesh.position.x;
        this.sun.target.position.z = this.actor.mesh.position.z;
        this.sun.position.x = this.sun.target.position.x + 5;
        this.sun.position.z = this.sun.target.position.z - 10;
    }
}