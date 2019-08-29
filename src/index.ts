import * as THREE from 'three';
import Identity from './utilities/Identity';
import EntityManager from './utilities/EntityManager';
import NauticalScene from './entities/NauticalScene';
import TrackingCamera from './entities/TrackingCamera';
import InputState from './components/InputState';
import { createPlayerBoat, createTerrain } from './utilities/factories/entityFactory';
import * as keyboardInput from './utilities/keyboardInput';
import { STEP_SIZE_IN_MS } from './constants';
import * as debug from './utilities/debugOutput';
import BoatControlState from './components/BoatControlState';
import { Input } from './ctrlScheme';
import PlayerControl from './systems/PlayerControl';
import BoatDriver from './systems/BoatDriver';
import BoatLocomotion from './components/BoatLocomotion';
import Physics from './systems/Physics';
import TerrainCollider from './components/TerrainCollider';
import Position from './components/Position';
import { updateMap } from './utilities/minimap';
import { roll } from './utilities/helpers';

function main() {
    // Setup
    debug.initialize(document.getElementById('debug') as HTMLDivElement);
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    //const boatSound = initializeSound();
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.shadowMap.enabled = true;
    const identity = new Identity();

    const world = new EntityManager();

    const scene = new NauticalScene();

    // Components and systems
    // Boat
    const keys = new InputState(identity.next(), 1000);
    const boat = createPlayerBoat(identity, keys);

    world.entitites.push(boat);
    world.entitites.push(createTerrain(identity));
    world.systems.push(new PlayerControl());
    world.systems.push(new BoatDriver());
    world.systems.push(new Physics());

    keyboardInput.initialize(keys);

    // World and rendering
    initializeCamera(scene.camera);
    const actor = boat.components[Position.name] as Position;
    let lastUpdate = performance.now();
    let delta = 0;
    requestAnimationFrame(render);

    function render(time: number) {

        delta = Math.min(delta + (time - lastUpdate), 10 * STEP_SIZE_IN_MS);
        lastUpdate = time;
        time *= 0.001;  // convert time to seconds
        while (delta >= STEP_SIZE_IN_MS) {
            delta -= STEP_SIZE_IN_MS;
            scene.step(time);

            world.update();
            
            scene.actor.mesh.position.x = actor.lon;
            scene.actor.mesh.position.z = -actor.lat;
            scene.actor.mesh.rotation.y = Math.PI - actor.heading;
            /*
            playerControl.parse(inputBlock);
            applyControl.parse(controlBlock);
            applyPhysics.parse(physicsBlock);
            applyTransform.parse(transformBlock);
            follow.parse(followBlock);
            updateModel.parse(modelBlock);
            animateBoat.parse(animationBlock);

            */
            updateMap(actor.lon, actor.lat, '#fff');
        }

        //boatSound.volume = (controlBlock.movement[0] as Movement).speed * 0.75;
        scene.camera.update();

        renderer.render(scene, scene.camera);
        debug.log('Orders', parseControls(keys, boat.components[BoatControlState.name] as BoatControlState));
        debug.log('Movement', parseMovement(boat.components[BoatLocomotion.name] as BoatLocomotion));
        debug.log('Position', parsePosition(actor));
        debug.print();
        requestAnimationFrame(render);
    }

}

main();

function initializeCamera(camera: TrackingCamera) {
    document.addEventListener('wheel', camera.onWheel.bind(camera));
    document.addEventListener('mousedown', camera.onMouseDown.bind(camera));
    document.addEventListener('mouseup', camera.onMouseUp.bind(camera));
    document.addEventListener('mousemove', camera.onMouseMove.bind(camera));
    camera.dragRotate(Math.PI / 3);
    camera.dragElevate(Math.PI / 4);
}

/*
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
*/

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