import * as THREE from 'three';
import Identity from './utilities/Identity';
import EntityManager from './utilities/EntityManager';
import NauticalScene from './render/NauticalScene';
import TrackingCamera from './render/TrackingCamera';
import InputState from './components/InputState';
import EntityFactory from './utilities/factories/EntityFactory';
import * as keyboardInput from './utilities/keyboardInput';
import { STEP_SIZE_IN_MS } from './constants';
import * as debug from './utilities/debugOutput';
import BoatControlState from './components/BoatControlState';
import PlayerControl from './systems/PlayerControl';
import SailDriver from './systems/SailDriver';
import BoatLocomotion from './components/BoatLocomotion';
import Physics from './systems/Physics';
import Position from './components/Position';
import { updateMap } from './utilities/minimap';
import { wrap } from './utilities/helpers';
import { Vector3, Vector2 } from 'three';
import { Sound } from './utilities/sound';
import Transform from './components/Transform';
import Wind from './components/Wind';
import DebugControl from './systems/DebugControl';
import SailAnimator from './systems/SailAnimator';
import AnimationTweener from './systems/AnimationTweener';
import SailRigging from './components/SailRigging';
import AnimationRigging from './components/AnimationRigging';

let going = true;
document.getElementById('pause').addEventListener('click', () => going = false);
document.getElementById('resume').addEventListener('click', () => going = true);


function main() {
    THREE.Object3D.DefaultUp = new Vector3(0, 0, 1);
    // Setup
    debug.initialize(document.getElementById('debug') as HTMLDivElement);
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const boatSound = initializeSound();
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.shadowMap.enabled = true;
    const identity = new Identity();

    const world = new EntityManager();

    const scene = new NauticalScene();
    document.getElementById('forces').addEventListener('input', e => (e.target as HTMLInputElement).checked ? scene.showForceGizmos() : scene.hideForceGizmos());

    // Components and systems
    const factory = new EntityFactory(identity);
    const keys = new InputState(identity.next(), 1000);
    keyboardInput.initialize(keys);
    const boat = factory.createPlayerBoat(keys);
    const env = factory.createEnvironment(keys);

    world.entitites.push(boat);
    world.entitites.push(factory.createTerrain());
    world.entitites.push(env);
    world.systems.push(new PlayerControl());
    world.systems.push(new DebugControl());
    world.systems.push(new SailDriver());
    world.systems.push(new Physics());
    world.systems.push(new SailAnimator());
    world.systems.push(new AnimationTweener());

    // World and rendering
    initializeCamera(scene.camera);
    scene.bindActorToEntity(boat);
    const actor = boat.components[Position.name] as Position;
    const driver = boat.components[BoatLocomotion.name] as BoatLocomotion;
    const rigging = boat.components[AnimationRigging.name] as SailRigging;

    // Force gizmos and environemt
    const updateWindGizmos = addForceGizmos(scene, driver, actor);

    let lastUpdate = performance.now();
    let delta = 0;
    requestAnimationFrame(render);

    function render(time: number) {

        delta = Math.min(delta + (time - lastUpdate), 10 * STEP_SIZE_IN_MS);
        lastUpdate = time;
        time *= 0.001;  // convert time to seconds
        while (delta >= STEP_SIZE_IN_MS) {
            delta -= STEP_SIZE_IN_MS;

            if (going) {
                world.update();
            }
            scene.step(time);
            //updateWindGizmos(env.components[Wind.name] as Wind);
            debugAnimation(rigging);

            updateMap(actor.lon, actor.lat, '#fff');
        }

        boatSound.volume = (driver.forces.forward / driver.limits.forward) * 0.75;
        scene.camera.update();

        renderer.render(scene, scene.camera);
        //debug.log('Orders', parseControls(keys, boat.components[BoatControlState.name] as BoatControlState));
        //debug.log('Movement', parseMovement(driver));
        //debug.log('Position', parsePosition(actor));
        debug.print();
        requestAnimationFrame(render);
    }

}

main();

function debugAnimation(rigging: SailRigging) {
    debug.log('Animation', `${rigging.clips.heel.state} ${rigging.clips.heel.targetState}`);
    debug.log('State', `${rigging.clips.heel.changeRate}`);

}

function addForceGizmos(scene: NauticalScene, driver: BoatLocomotion, actor: Position) {
    const windHelper = new Transform(500, 1000);
    const aoaHelper = new Transform(501, 1000);
    const liftHelper = new Transform(502, 1000);
    const dragHelper = new Transform(503, 1000);
    const localWindX = new Transform(504, 1000);
    const localWindY = new Transform(505, 1000);
    const forceHelper = new Transform(506, 1000);
    //scene.addForceGizmo({ forceRef: driver.forces, scalarName: 'forward', headingRef: actor, headingName: 'heading' });
    //scene.addForceGizmo({ fixedScale: 2, headingRef: driver, headingName: 'trimAngle', trackActor: true, invertHeading: true, color: 0xffff00 });
    scene.addForceGizmo({ transform: windHelper, color: 0x0000ff });
    scene.addForceGizmo({ transform: aoaHelper, color: 0x6666ff });
    //scene.addForceGizmo({ transform: liftHelper, color: 0x00ff00 });
    //scene.addForceGizmo({ transform: dragHelper, color: 0xff0000 });
    //scene.addForceGizmo({ transform: localWindX, color: 0xff00ff });
    //scene.addForceGizmo({ transform: localWindY, color: 0x00ffff });
    //scene.addForceGizmo({ transform: forceHelper, color: 0x000001 });

    return (wind: Wind) => deriveWindForces(actor, driver, wind, windHelper, aoaHelper, liftHelper, dragHelper, localWindX, localWindY, forceHelper);
}

function deriveWindForces(
    actor: Position,
    driver: BoatLocomotion,
    wind: Wind,
    windHelper: Transform,
    aoaHelper: Transform,
    liftHelper: Transform,
    dragHelper: Transform,
    localWindX: Transform,
    localWindY: Transform,
    forceHelper: Transform) {
    //wind.windHeading = roll(wind.windHeading + Math.PI * 0.001, 0, Math.PI * 2);

    windHelper.heading = wind.windHeading;
    windHelper.forward = wind.windSpeed;

    const windVector = new Vector2(Math.sin(wind.windHeading) * wind.windSpeed, Math.cos(wind.windHeading) * wind.windSpeed);
    const velocityVector = new Vector2(Math.sin(actor.heading) * driver.forces.forward, Math.cos(actor.heading) * driver.forces.forward);
    const apparentWindVector = new Vector2(windVector.x - velocityVector.x, windVector.y - velocityVector.y);

    aoaHelper.heading = wrap(Math.PI * 0.5 - apparentWindVector.angle(), 0, Math.PI * 2);
    aoaHelper.forward = apparentWindVector.length();

    debug.log('Sails', `AoA: ${toDeg(driver.AoA)}, ${Math.sign(driver.AoA) + Math.sign(driver.trimAngle) == 0 ? 'hauling' : 'luffing'}`);
    debug.log('Speed', `${(driver.forces.forward * 1.94).toFixed(2)} knots`);

    localWindX.heading = Math.PI * 0.5 + actor.heading;
    localWindX.forward = driver.localWind.x;
    localWindY.heading = actor.heading;
    localWindY.forward = driver.localWind.y;

    dragHelper.heading = driver.trimAngle + actor.heading + Math.PI * 0.5 * Math.sign(driver.trimAngle) * -1;
    dragHelper.forward = driver.drag;
    liftHelper.heading = driver.trimAngle + actor.heading + Math.PI * 0.5 * Math.sign(driver.trimAngle) * -1;
    liftHelper.forward = driver.lift;

    const sailForce = new Vector2(driver.sailForce.x, driver.sailForce.y);
    forceHelper.heading = Math.PI * 0.5 - sailForce.angle() + actor.heading;
    forceHelper.forward = sailForce.length();

    // Local readings
    debug.log('Local Apparent Wind', `X,Y: ${driver.localWind.x.toFixed(2)} ${driver.localWind.y.toFixed(2)}`);
    debug.log('Force', `Drag: ${driver.drag.toFixed(2)} Lift: ${driver.lift.toFixed(2)} Forward: ${driver.sailForce.y.toFixed(2)}`);
    debug.log('Sail Force Vector', `X,Y: ${driver.sailForce.x.toFixed(2)} ${driver.sailForce.y.toFixed(2)}`);

    function toDeg(rad: number) {
        return (rad / Math.PI * 180).toFixed(0);
    }
}

function initializeCamera(camera: TrackingCamera) {
    document.addEventListener('wheel', camera.onWheel.bind(camera));
    document.addEventListener('mousedown', camera.onMouseDown.bind(camera));
    document.addEventListener('mouseup', camera.onMouseUp.bind(camera));
    document.addEventListener('mousemove', camera.onMouseMove.bind(camera));
    camera.dragRotate(Math.PI / 3);
    camera.dragElevate(Math.PI / 4);
}

function initializeSound() {
    const seaAmbience = new Sound('audio/sea.mp3');
    seaAmbience.volume = 0.25;
    seaAmbience.loop = true;
    const boatSound = new Sound('audio/surf.mp3');
    boatSound.volume = 0.0;
    boatSound.loop = true;

    seaAmbience.play();
    boatSound.play();

    return boatSound;
}

function parseControls(keys: InputState, state: BoatControlState): string {
    const text = [
        `${state.accelerating && !state.decelerating ? 'More sails' : state.decelerating && !state.accelerating ? 'Less sails' : 'Let go and haul'}`,
        `${state.turningLeft ? 'lay to port' : state.turningRight ? 'lay to starboard' : 'stay course'}`
    ];
    state.trimmingLeft || state.trimmingRight ? text.push('trim sails') : undefined;
    return text.join(', ');
}

function parseMovement(driver: BoatLocomotion): string {
    const text = [
        '<ul>',
        `<li>Turn Rate: ${(driver.forces.heading / Math.PI * 180).toFixed(0)}</li>`,
        `<li>Speed: ${(driver.forces.forward * 1.94384).toFixed(1)} knots (${(driver.forces.forward / driver.limits.forward * 100).toFixed(0)}%)</li>`,
        '</ul>'
    ];
    return text.join('');
}

function parsePosition(position: Position): string {
    const text = [
        '<ul>',
        `<li>X: ${position.x.toFixed(0)} Y: ${position.y.toFixed(0)}</li>`,
        `<li>Heading: ${(wrap(position.heading, 0, Math.PI * 2) / Math.PI * 180).toFixed(0)} degrees</li>`,
        '</ul>'
    ];
    return text.join('');
}