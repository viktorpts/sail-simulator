import { Scene, Color, AmbientLight, Mesh, Object3D, Vector3, Quaternion } from 'three';
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
        const compass = makeCompass();
        compass.position.z = 0.01;
        this.add(compass);

        this._heightMap = generateHeight(WORLD_HSEGMENTS, WORLD_VSEGMENTS, SEED);
        const terrain = makeTerrain(this._heightMap, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
        const boat = new Boat();
        this._actor = boat;
        this.waves = makeWaves();
        const sea = makeSea(this._heightMap, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
        sea.position.z = -0.1;
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
        this.sun.target.position.y = this.actor.mesh.position.y;
        this.sun.position.x = this.sun.target.position.x + 5;
        this.sun.position.y = this.sun.target.position.y + 10;
    }

    bindActorToEntity(boat: PlayerBoat) {
        this._actorEntity = {
            driver: boat.components[BoatLocomotion.name] as BoatLocomotion,
            position: boat.components[Position.name] as Position
        }
    }

    private updateActor(time: number) {
        this._actor.mesh.rotation.x = 0;
        this._actor.mesh.rotation.y = 0;
        //this._actor.mesh.rotation.z = 0;

        this._actor.mesh.position.x = this._actorEntity.position.lon;
        this._actor.mesh.position.y = this._actorEntity.position.lat;
        this._actor.mesh.rotation.z = -this._actorEntity.position.heading;
        //this._actor.mesh.rotateOnAxis(new Vector3(0, 0, 1), Math.PI * 2 - this._actorEntity.position.heading);
        
        this._actor.rudder.rotation.z = this._actorEntity.driver.forces.heading;
        
        this._actor.mainsail.rotation.z = -this._actorEntity.driver.trimAngle;
        this._actor.headsail.rotation.z = -this._actorEntity.driver.trimAngle * 1.2;
        
        const multiplier = this._actorEntity.driver.trimAngle > 0 ? 1 : -1;
        const speedFraction = this._actorEntity.driver.forces.forward / this._actorEntity.driver.limits.forward;
        this._actor.mainsail.scale.x = Math.max(0.001, speedFraction) * multiplier;
        this._actor.headsail.scale.x = this._actor.mainsail.scale.x;
        
        // Bobbing
        //*
        this._actor.mesh.position.z = (Math.sin(time * 2 / 3) / 10) - 0.3;
        //this._actor.mesh.rotation.y = Math.sin(time) / 10 + (Math.PI / 3 - Math.abs(this._actor.mainsail.rotation.z)) * 0.4 * speedFraction * (this._actor.mainsail.rotation.z < 0 ? -1 : 1);
        const rotY = Math.sin(time) / 10 + (Math.PI / 3 - Math.abs(this._actor.mainsail.rotation.z)) * 0.4 * speedFraction * (this._actor.mainsail.rotation.z < 0 ? -1 : 1);
        this._actor.mesh.rotateOnAxis(new Vector3(0, 1, 0), rotY);
        //*/
    }

    addAndBind(object: Object3D, entity: GameEntity) {
        this.add(object);
        this._gameEntities.push({ object, entity });
    }

    private updateEntities(time: number) {
        for (let pair of this._gameEntities) {
            const position = pair.entity.components[Position.name] as Position;

            pair.object.position.x = position.x;
            pair.object.position.y = position.y;
            pair.object.position.z = position.z;

            pair.object.rotation.x = position.rotX;
            pair.object.rotation.y = position.rotY;
            pair.object.rotation.z = -position.rotZ;
        }
    }
}