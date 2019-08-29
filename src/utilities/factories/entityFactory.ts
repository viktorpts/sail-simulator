import InputState from "../../components/InputState";
import PlayerBoat from "../../entities/PlayerBoat";
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

const turnRateDelta = Math.PI * 0.5;
const maxTurnRate = Math.PI * 0.25;
const acceleration = 4;
const maxSpeed = 10;
const trimRate = Math.PI * 0.25;
const maxTrimAngle = Math.PI * 0.3;

export function createPlayerBoat(identity: Identity, input: InputState) {
    const boat = new PlayerBoat(identity.next());

    const control = new BoatControlState(identity.next(), boat.id);
    const driver = createBoatDriver(identity, boat.id);
    const position = new Position({x: 0, y: 0, z: 0}, {rotX: 0, rotY: 0, rotZ: 0}, identity.next(), boat.id);

    boat.init(input, control, driver, position);

    return boat;
}

export function createBoatDriver(identity: Identity, boatId: number) {
    const driver = new BoatLocomotion(identity.next(), boatId);
    driver.forces = new Force({x: 0, y: 0, z: 0}, {rotX: 0, rotY: 0, rotZ: 0}, identity.next(), driver.id);
    driver.rates = new ForceRate({x: 0, y: acceleration, z: 0}, {rotX: 0, rotY: 0, rotZ: turnRateDelta}, identity.next(), driver.id);
    driver.limits = new ForceLimit({x: 0, y: maxSpeed, z: 0}, {rotX: 0, rotY: 0, rotZ: maxTurnRate}, identity.next(), driver.id);
    driver.trimAngle = 0;
    driver.trimRate = trimRate;
    driver.maxTrimAngle = maxTrimAngle;

    return driver;
}

export function createTerrain(identity: Identity, parentId: number) {
    const heightMap = generateHeight(WORLD_HSEGMENTS, WORLD_VSEGMENTS, SEED);
    return new TerrainCollider(heightMap, identity.next(), parentId);
}