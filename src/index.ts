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
import BoatDriver from './systems/BoatDriver';
import BoatLocomotion from './components/BoatLocomotion';
import Physics from './systems/Physics';
import Position from './components/Position';
import { updateMap } from './utilities/minimap';
import { roll } from './utilities/helpers';
import { Vector3, Vector2 } from 'three';
import { Sound } from './utilities/sound';
import Transform from './components/Transform';
import Wind from './components/Wind';

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

    // Components and systems
    const factory = new EntityFactory(identity);
    const keys = new InputState(identity.next(), 1000);
    keyboardInput.initialize(keys);
    const boat = factory.createPlayerBoat(keys);
    const env = factory.createEnvironment();

    world.entitites.push(boat);
    world.entitites.push(factory.createTerrain());
    world.entitites.push(env);
    world.systems.push(new PlayerControl());
    world.systems.push(new BoatDriver());
    world.systems.push(new Physics());

    // World and rendering
    initializeCamera(scene.camera);
    scene.bindActorToEntity(boat);
    const actor = boat.components[Position.name] as Position;
    const driver = boat.components[BoatLocomotion.name] as BoatLocomotion;

    // Force gizmos and environemt
    const windHelper = new Transform(500, 1000);
    const appHelper = new Transform(501, 1000);
    const aoaHelper = new Transform(501, 1000);
    scene.addForceGizmo({ forceRef: driver.forces, scalarName: 'forward', headingRef: actor, headingName: 'heading' });
    scene.addForceGizmo({ fixedScale: 4, headingRef: driver, headingName: 'trimAngle', trackActor: true, color: 0xffff00 });
    scene.addForceGizmo({ transform: windHelper, color: 0x0000ff });
    scene.addForceGizmo({ transform: appHelper, color: 0x6666ff });
    scene.addForceGizmo({ transform: aoaHelper, color: 0xff66ff });

    let lastUpdate = performance.now();
    let delta = 0;
    requestAnimationFrame(render);

    function render(time: number) {

        delta = Math.min(delta + (time - lastUpdate), 10 * STEP_SIZE_IN_MS);
        lastUpdate = time;
        time *= 0.001;  // convert time to seconds
        while (delta >= STEP_SIZE_IN_MS) {
            delta -= STEP_SIZE_IN_MS;

            world.update();
            scene.step(time);
            deriveWindForces(actor, driver, env.components[Wind.name] as Wind, windHelper, appHelper, aoaHelper);

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

function deriveWindForces(actor: Position, driver: BoatLocomotion, wind: Wind, windHelper: Transform, appHelper: Transform, aoaHelper: Transform) {
    //wind.windHeading = roll(wind.windHeading + Math.PI * 0.001, 0, Math.PI * 2);

    windHelper.heading = wind.windHeading;
    windHelper.forward = wind.windSpeed;

    const windVector = new Vector2(Math.sin(wind.windHeading) * wind.windSpeed, Math.cos(wind.windHeading) * wind.windSpeed);
    debug.log('Wind', `Heading: ${wind.windHeading.toFixed(2)} Speed: ${wind.windSpeed.toFixed(2)}`);
    debug.log('As Vector', `X,Y: ${windVector.x.toFixed(2)}, ${windVector.y.toFixed(2)}`);

    const velocityVector = new Vector2(Math.sin(actor.heading) * driver.forces.forward, Math.cos(actor.heading) * driver.forces.forward);
    debug.log('Velocity', `X,Y: ${velocityVector.x.toFixed(2)}, ${velocityVector.y.toFixed(2)}`);

    const apparentWindVector = new Vector2(windVector.x - velocityVector.x, windVector.y - velocityVector.y);
    debug.log('Apparent', `X,Y: ${apparentWindVector.x.toFixed(2)}, ${apparentWindVector.y.toFixed(2)}`);

    appHelper.heading = roll(Math.PI * 0.5 - apparentWindVector.angle(), 0, Math.PI * 2);
    appHelper.forward = apparentWindVector.length();

    const AoA = roll(driver.trimAngle + actor.heading + Math.PI, 0, Math.PI * 2) - appHelper.heading;
    debug.log('Sails', `AoA: ${AoA.toFixed(2)}, ${Math.sign(AoA) + Math.sign(driver.trimAngle) == 0 ? 'hauling' : 'luffing'}`);

    const efficiency = AoA * driver.trimAngle
    debug.log('Sail efficiency', `${-efficiency.toFixed(2)} %`);
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
        `<li>Heading: ${(roll(position.heading, 0, Math.PI * 2) / Math.PI * 180).toFixed(0)} degrees</li>`,
        '</ul>'
    ];
    return text.join('');
}