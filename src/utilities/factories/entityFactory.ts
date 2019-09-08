import InputState from "../../components/InputState";
import SailBoat from "../../entities/SailBoat";
import Identity from "../Identity";
import BoatControlState from "../../components/BoatControlState";
import BoatLocomotion from "../../components/BoatLocomotion";
import Position from "../../components/Position";
import Force from "../../components/Force";
import ForceRate from "../../components/ForceRate";
import ForceLimit from "../../components/ForceLimit";
import { generateHeight } from "../../util";
import { WORLD_HSEGMENTS, WORLD_VSEGMENTS, SEED } from "../../constants";
import TerrainCollider from "../../components/TerrainCollider";
import Terrain from "../../entities/Terrain";
import Environment from "../../entities/Environment";
import Wind from "../../components/Wind";
import SailRigging from "../../components/SailRigging";
import AnimationClip from "../../components/AnimationClip";

const turnRateDelta = Math.PI * 0.5;
const maxTurnRate = Math.PI * 0.25;
const acceleration = 4;
const maxSpeed = 10;
const trimRate = Math.PI * 0.4;
const maxTrimAngle = Math.PI * 0.4;

export default class EntityFactory {
    constructor(public identity: Identity) { }

    createPlayerBoat(input: InputState) {
        const boat = new SailBoat(this.identity.next());

        const control = new BoatControlState(this.identity.next(), boat.id);
        const driver = this.createBoatDriver(boat.id);
        const position = new Position({ x: 0, y: 0, z: 0 }, { rotX: 0, rotY: 0, rotZ: 0 }, this.identity.next(), boat.id);

        const rigging = new SailRigging(this.identity.next(), boat.id);
        const sailClip = new AnimationClip(this.identity.next(), rigging.id);
        sailClip.state = 0;
        sailClip.targetState = 0;
        sailClip.acceleration = 0.1;
        sailClip.maxRate = 5;
        const boomClip = new AnimationClip(this.identity.next(), rigging.id);
        boomClip.state = 0;
        boomClip.targetState = 0;
        boomClip.acceleration = 5;
        boomClip.maxRate = 10;
        const headClip = new AnimationClip(this.identity.next(), rigging.id);
        headClip.state = 0;
        headClip.targetState = 0;
        headClip.acceleration = 5;
        headClip.maxRate = 10;
        rigging.clips = { heel: sailClip, boom: boomClip, headsail: headClip };

        boat.init(input, control, driver, position, rigging);

        return boat;
    }

    createBoatDriver(boatId: number) {
        const driver = new BoatLocomotion(this.identity.next(), boatId);
        driver.forces = new Force({ x: 0, y: 0, z: 0 }, { rotX: 0, rotY: 0, rotZ: 0 }, this.identity.next(), driver.id);
        driver.rates = new ForceRate({ x: 0, y: acceleration, z: 0 }, { rotX: 0, rotY: 0, rotZ: turnRateDelta }, this.identity.next(), driver.id);
        driver.limits = new ForceLimit({ x: 0, y: maxSpeed, z: 0 }, { rotX: 0, rotY: 0, rotZ: maxTurnRate }, this.identity.next(), driver.id);
        driver.trimAngle = 0;
        driver.trimRate = trimRate;
        driver.maxTrimAngle = maxTrimAngle;
        driver.effSailArea = 0.5;

        return driver;
    }

    createTerrain() {
        const terrain = new Terrain(this.identity.next())
        terrain.init(this.createTerrainCollider(terrain.id));

        return terrain;
    }

    createTerrainCollider(parentId: number) {
        const heightMap = generateHeight(WORLD_HSEGMENTS, WORLD_VSEGMENTS, SEED);
        return new TerrainCollider(heightMap, this.identity.next(), parentId);
    }

    createEnvironment(input: InputState) {
        const env = new Environment(this.identity.next());
        const wind = this.createWind(env.id);

        env.init(wind, input);

        return env;
    }

    createWind(parentId: number) {
        const wind = new Wind(this.identity.next(), parentId);
        wind.windHeading = Math.PI * 0.75;
        wind.windSpeed = 10;

        return wind;
    }
}
