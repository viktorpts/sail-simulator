import * as THREE from 'three';
import Boat from './entities/Boat';
import { Input } from './ctrlScheme';
import { STEP_SIZE } from './constants';
import NauticalScene from './entities/NauticalScene';
import TrackingCamera from './entities/TrackingCamera';
// Components
import InputState from './components/InputState';
import BoatControlState from './components/BoatControlState';
import Movement from './components/Movement';
import Transform from './components/Transform';
import TerrainCollider from './components/TerrainCollider';
import Position from './components/Position';
import BoatAnimation from './components/BoatAnimation';
import Follower from './components/Follower';
// Utilities
import IdGenerator from './utilities/IdGenerator';
import { Sound } from './utilities/sound';
import * as debug from './utilities/debugOutput';
import * as keyboardInput from './utilities/keyboardInput';
import ComponentIndex from './utilities/ComponentCollections';
import { roll } from './utilities/helpers';
import {updateMap} from './utilities/minimap';
// Systems
import * as playerControl from './systems/playerControl';
import * as applyControl from './systems/applyControl';
import * as applyPhysics from './systems/physics';
import * as applyTransform from './systems/applyTransform';
import * as animateBoat from './systems/animateBoat';
import * as follow from './systems/follow';
import * as updateModel from './systems/updateModel';
import Model from './components/Model';
import { makeCompass } from './entities/modelMaker';

function main() {
    // Setup
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const boatSound = initializeSound();
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.shadowMap.enabled = true;
    const idGenerator = new IdGenerator();
    debug.initialize(document.getElementById('debug') as HTMLDivElement);
    const scene = new NauticalScene();

    // Components and systems
    // Boat
    const boatId = idGenerator.nextId();
    const keys = new InputState(idGenerator.nextId(), boatId);
    const controlState = new BoatControlState(idGenerator.nextId(), boatId);
    const movementState = new Movement(idGenerator.nextId(), boatId);
    const position = new Position({ x: 0, y: 0, z: 0 }, { rotX: 0, rotY: 0, rotZ: 0 }, idGenerator.nextId(), boatId);
    const transform = new Transform({ x: 0, y: 0, z: 0 }, { rotX: 0, rotY: 0, rotZ: 0 }, idGenerator.nextId(), boatId);
    const boatModel = new Model(scene.actor.mesh, idGenerator.nextId(), boatId);
    const boatAnimation = new BoatAnimation(scene.actor, idGenerator.nextId(), boatId);
    // Arrow
    const arrowId = idGenerator.nextId();
    const aPosition = new Position({ x: 0, y: 0, z: 0 }, { rotX: 0, rotY: 0, rotZ: 0 }, idGenerator.nextId(), arrowId);
    const follower = new Follower(position, idGenerator.nextId(), arrowId);
    const arrowMesh = makeCompass();
    scene.add(arrowMesh);
    const aModel = new Model(arrowMesh, idGenerator.nextId(), arrowId);

    const inputBlock: ComponentIndex = {
        inputState: [keys],
        controlState: [controlState]
    };
    const controlBlock: ComponentIndex = {
        controlState: [controlState],
        movement: [movementState]
    };
    const physicsBlock: ComponentIndex = {
        movement: [movementState],
        transform: [transform],
        position: [position],
        controlState: [controlState],
        terrain: [new TerrainCollider(scene.heightMap, idGenerator.nextId(), boatId)]
    };
    const transformBlock: ComponentIndex = {
        transform: [transform],
        position: [position]
    };
    const modelBlock: ComponentIndex = {
        model: [boatModel, aModel],
        position: [position, aPosition]
    };
    const followBlock: ComponentIndex = {
        follower: [follower],
        position: [aPosition]
    }
    const animationBlock: ComponentIndex = {
        position: [position],
        model: [boatAnimation],
        movement: [movementState]
    };

    keyboardInput.initialize(keys);

    // World and rendering
    initializeCamera(scene.camera);
    let lastUpdate = performance.now();
    let delta = 0;
    requestAnimationFrame(render);

    function render(time: number) {

        delta = Math.min(delta + (time - lastUpdate), 10 * STEP_SIZE);
        lastUpdate = time;
        time *= 0.001;  // convert time to seconds
        while (delta >= STEP_SIZE) {
            //processInput(keys, scene.actor);

            delta -= STEP_SIZE;
            scene.step(time);

            playerControl.parse(inputBlock);
            applyControl.parse(controlBlock);
            applyPhysics.parse(physicsBlock);
            applyTransform.parse(transformBlock);
            follow.parse(followBlock);
            updateModel.parse(modelBlock);
            animateBoat.parse(animationBlock);

            updateMap(position.x, position.z, '#fff');
        }

        boatSound.volume = (controlBlock.movement[0] as Movement).speed * 0.75;
        scene.camera.update();

        renderer.render(scene, scene.camera);
        debug.log('Orders', parseControls(inputBlock.controlState[0] as BoatControlState));
        debug.log('Movement', parseMovement(controlBlock.movement[0] as Movement));
        debug.log('Position', parsePosition(physicsBlock.position[0] as Position, scene.actor));
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

function parseControls(state: BoatControlState): string {
    const text = [
        `${state.accelerating && !state.decelerating ? 'More sails' : state.decelerating && !state.accelerating ? 'Less sails' : 'Let go and haul'}`,
        `${state.turningLeft ? 'lay to port' : state.turningRight ? 'lay to starboard' : 'stay course'}`
    ];
    state.trimmingLeft || state.trimmingRight ? text.push('trim sails') : undefined;
    return text.join(', ');
}

function parseMovement(movement: Movement): string {
    const text = [
        '<ul>',
        `<li>Turn Rate: ${(movement.turnRate * movement.maxTurnRate / Math.PI * 180).toFixed(0)}</li>`,
        `<li>Speed: ${(movement.speed * movement.maxSpeed * 1.94384).toFixed(1)} knots (${(movement.speed * 100).toFixed(0)}%)</li>`,
        '</ul>'
    ];
    return text.join('');
}

function parsePosition(position: Position, boat: Boat): string {
    const text = [
        '<ul>',
        `<li>X: ${position.x.toFixed(0)} Z: ${position.z.toFixed(0)}</li>`,
        `<li>Heading: ${(roll(position.rotY + Math.PI, 0, Math.PI * 2) / Math.PI * 180).toFixed(0)} degrees</li>`,
        '</ul>'
    ];
    return text.join('');
}