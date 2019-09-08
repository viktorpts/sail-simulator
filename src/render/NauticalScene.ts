import { Scene, Color, AmbientLight, Mesh, Object3D, Vector3, Quaternion, Vector2 } from 'three';
import { makeCompass, makeTerrain, makeWaves, makeSea, makeWaterflow, makeArrow } from './modelMaker';
import Boat from './Boat';
import { WORLD_HSEGMENTS, WORLD_VSEGMENTS, SEED } from '../constants';
import { generateHeight } from '../util';
import TrackingCamera from './TrackingCamera';
import NauticalSun from "./NauticalSun";
import SailBoat from '../entities/SailBoat';
import BoatLocomotion from '../components/BoatLocomotion';
import Position from '../components/Position';
import GameEntity from '../entities/GameEntity';
import GameComponent from '../components/GameComponent';
import Transform from '../components/Transform';


export default class NauticalScene extends Scene {
    private _camera: TrackingCamera;
    private _actor: Boat;
    private waves: { mesh: Mesh, update: Function, getOffset: Function };
    private sun: NauticalSun;
    private _heightMap: Int16Array;
    private _actorEntity: { driver: BoatLocomotion, position: Position };
    private _gameEntities: { object: Object3D, entity: GameEntity }[] = [];
    private _gizmos: { mesh: Object3D, update: { (): void } }[] = [];
    showForces = false;

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
        const sea = makeSea(this._heightMap, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
        sea.position.z = -0.1;
        this.add(boat.mesh);
        //this.add(terrain);
        this.add(sea);
        // Water surface
        this.waves = makeWaves();
        this.add(makeWaterflow());
        /*
        for (let x = -10; x < 10; x++) {
            for (let y = -10; y < 10; y++) {
                this.add(this.waves.getOffset(x, y));
            }
        }
        */

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
        this.updateForceGizmos(time);

        this.sun.target.position.x = this.actor.mesh.position.x;
        this.sun.target.position.y = this.actor.mesh.position.y;
        this.sun.position.x = this.sun.target.position.x + 5;
        this.sun.position.y = this.sun.target.position.y + 10;
    }

    bindActorToEntity(boat: SailBoat) {
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
        this._actor.headsail.rotation.z = -this._actorEntity.driver.trimAngle * 1.3;

        const multiplier = this._actorEntity.driver.trimAngle > 0 ? 1 : -1;
        const sailForce = new Vector2(this._actorEntity.driver.sailForce.x, this._actorEntity.driver.sailForce.y);
        const speedFraction = sailForce.length() / 5;
        this._actor.mainsail.scale.x = Math.max(0.001, speedFraction) * multiplier;
        this._actor.headsail.scale.x = this._actor.mainsail.scale.x;

        // Bobbing
        //*
        this._actor.mesh.position.z = (Math.sin(time * 2 / 3) / 10);
        //this._actor.mesh.rotation.y = Math.sin(time) / 10 + (Math.PI / 3 - Math.abs(this._actor.mainsail.rotation.z)) * 0.4 * speedFraction * (this._actor.mainsail.rotation.z < 0 ? -1 : 1);
        const rotY = Math.sin(time) / 10 + (Math.PI / 3 - Math.abs(this._actor.mainsail.rotation.z)) * 0.4 * speedFraction * (this._actor.mainsail.rotation.z < 0 ? -1 : 1);
        this._actor.mesh.rotateOnAxis(new Vector3(0, 1, 0), rotY);
        //*/
    }

    addAndBind(object: Object3D, entity: GameEntity) {
        this.add(object);
        this._gameEntities.push({ object, entity });
    }

    addForceGizmo(reference: { transform: Transform, color?: number }): void;
    addForceGizmo<T extends GameComponent, K extends keyof T>(reference: { forceRef: T, scalarName: K, invertForce?: boolean, fixedHeading: number, trackActor?: boolean, color?: number }): void;
    addForceGizmo<J extends GameComponent, L extends keyof J>(reference: { fixedScale: number, headingRef: J, headingName: L, invertHeading?: boolean, trackActor?: boolean, color?: number }): void;
    addForceGizmo<T extends GameComponent, K extends keyof T, J extends GameComponent, L extends keyof J>(
        reference: {
            forceRef: T,
            scalarName: K,
            invertForce?: boolean,
            headingRef: J,
            headingName: L,
            invertHeading?: boolean,
            trackActor?: boolean,
            color?: number
        }): void;
    addForceGizmo(reference: any) {
        if (reference.transform !== undefined) {
            reference.headingRef = reference.transform;
            reference.headingName = 'heading';
            reference.forceRef = reference.transform;
            reference.scalarName = 'forward';
        }
        reference.color = reference.color || 0xffffff;
        const arrow = makeArrow(reference.color);
        arrow.position.z = 6 + this._gizmos.length * 0.01;
        if (reference.fixedHeading !== undefined) {
            arrow.rotation.z = -reference.fixedHeading;
        }
        if (reference.fixedScale !== undefined) {
            arrow.scale.y = reference.fixedScale || 0.01;
        }
        if (this.showForces === false) {
            arrow.visible = false;
        }
        this.add(arrow);
        this._gizmos.push({
            mesh: arrow,
            update: () => {
                arrow.position.x = this._actorEntity.position.x;
                arrow.position.y = this._actorEntity.position.y;

                if (reference.fixedHeading === undefined) {
                    arrow.rotation.z = -(reference.headingRef[reference.headingName] as number) + (reference.invertHeading ? Math.PI : 0);
                    if (reference.trackActor) {
                        arrow.rotation.z -= this._actorEntity.position.heading;
                    }
                }
                if (reference.fixedScale === undefined) {
                    arrow.scale.y = ((reference.forceRef[reference.scalarName] as number) * (reference.invertForce ? -1 : 1)) || 0.01;
                }
            }
        });
    }

    showForceGizmos() {
        this.showForces = true;
        this._gizmos.forEach(g => g.mesh.visible = true);
    }

    hideForceGizmos() {
        this.showForces = false;
        this._gizmos.forEach(g => g.mesh.visible = false);
    }

    private updateForceGizmos(time: number) {
        this._gizmos.forEach(g => g.update());
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