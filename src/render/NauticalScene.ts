import { Scene, Color, AmbientLight, Mesh, Object3D } from 'three';
import { makeCompass, makeTerrain, makeWaves, makeSea } from './modelMaker';
import Boat from './Boat';
import { WORLD_HSEGMENTS, WORLD_VSEGMENTS, SEED } from '../constants';
import { generateHeight } from '../util';
import TrackingCamera from './TrackingCamera';
import NauticalSun from "./NauticalSun";
import PlayerBoat from '../entities/PlayerBoat';
import BoatLocomotion from '../components/BoatLocomotion';
import Position from '../components/Position';
import GameEntity from '../entities/GameEntity';


export default class NauticalScene extends Scene {
    private _camera: TrackingCamera;
    private _actor: Boat;
    private waves: { mesh: Mesh, update: Function, getOffset: Function };
    private sun: NauticalSun;
    private _heightMap: Int16Array;
    private _actorEntity: { driver: BoatLocomotion, position: Position };
    private _gameEntities: { object: Object3D, entity: GameEntity }[] = [];

    constructor() {
        super();
        this.background = new Color(0xaaccff);
        const ambient = new AmbientLight(0x555555);
        this.add(ambient);
        this.sun = new NauticalSun();
        this.add(this.sun, this.sun.target);

        this.add(makeCompass());

        this._heightMap = generateHeight(WORLD_HSEGMENTS, WORLD_VSEGMENTS, SEED);
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
        this.updateActor(time);
        this.updateEntities(time);

        this.sun.target.position.x = this.actor.mesh.position.x;
        this.sun.target.position.z = this.actor.mesh.position.z;
        this.sun.position.x = this.sun.target.position.x + 5;
        this.sun.position.z = this.sun.target.position.z - 10;
    }

    bindActorToEntity(boat: PlayerBoat) {
        this._actorEntity = {
            driver: boat.components[BoatLocomotion.name] as BoatLocomotion,
            position: boat.components[Position.name] as Position
        }
    }

    private updateActor(time: number) {
        this._actor.mesh.position.x = this._actorEntity.position.lon;
        this._actor.mesh.position.z = -this._actorEntity.position.lat;
        this._actor.mesh.rotation.y = Math.PI - this._actorEntity.position.heading;
    }

    addAndBind(object: Object3D, entity: GameEntity) {
        this.add(object);
        this._gameEntities.push({object, entity});
    }

    private updateEntities(time: number) {
        for (let pair of this._gameEntities) {
            const position = pair.entity.components[Position.name] as Position;

            pair.object.position.x = position.x;
            pair.object.position.z = -position.y;
            pair.object.position.y = position.z;

            pair.object.rotation.x = position.rotX;
            pair.object.rotation.y = Math.PI - position.rotZ;
            pair.object.rotation.z = position.rotY;
        }
    }
}