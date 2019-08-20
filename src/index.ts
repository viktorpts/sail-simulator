import * as THREE from 'three';
import { makeWaves, makeTerrain, makeSea, makeCompass } from './models/modelMaker';
import Boat from './models/Boat';
import { deltaFromAngle, generateHeight, print } from './util';
import { Input } from './CtrlScheme';
import { WORLD_HSEGMENTS, WORLD_VSEGMENTS, STEP_SIZE } from './constants';
import TrackingCamera from './models/TrackingCamera';

function main() {
    const keys: any = {};
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    document.addEventListener('keydown', (e) => keys[e.code] = true);
    document.addEventListener('keyup', (e) => keys[e.code] = false);

    const seaAmbience = document.createElement('audio');
    const seaAmbienceSource = document.createElement('source');
    seaAmbienceSource.src = 'audio/sea.mp3';
    seaAmbience.appendChild(seaAmbienceSource);
    seaAmbience.volume = 0.25;
    seaAmbience.loop = true;
    const boatSound = document.createElement('audio');
    const boatSoundSource = document.createElement('source');
    boatSoundSource.src = 'audio/surf.mp3';
    boatSound.appendChild(boatSoundSource);
    boatSound.volume = 0.1;
    boatSound.loop = true;

    seaAmbience.play();
    boatSound.play();


    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaccff);
    const ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient);
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    light.shadow.mapSize.height = 1024;
    light.shadow.mapSize.width = 1024;
    light.castShadow = true;
    light.position.set(-10, 10, 40);
    scene.add(light, light.target);

    scene.add(makeCompass());

    const z = 152;
    const data = generateHeight(WORLD_HSEGMENTS, WORLD_VSEGMENTS, z);
    const terrain = makeTerrain(data, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
    const boat = new Boat(data, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
    const waves = makeWaves();
    const sea = makeSea(data, WORLD_HSEGMENTS, WORLD_VSEGMENTS);
    scene.add(boat.mesh);
    scene.add(terrain);
    scene.add(sea);
    for (let x = -10; x < 10; x++) {
        for (let y = -10; y < 10; y++) {
            scene.add(waves.getOffset(x, y));
        }
    }

    let lastUpdate = performance.now();
    let delta = 0;

    const camera = new TrackingCamera(boat.mesh);
    document.addEventListener('wheel', camera.onWheel.bind(camera));
    document.addEventListener('mousedown', camera.onMouseDown.bind(camera));
    document.addEventListener('mouseup', camera.onMouseUp.bind(camera));
    document.addEventListener('mousemove', camera.onMouseMove.bind(camera));
    camera.dragRotate(Math.PI / 3);
    camera.dragElevate(Math.PI/ 4);

    requestAnimationFrame(render);

    function render(time: number) {
        delta += time - lastUpdate;
        lastUpdate = time;
        time *= 0.001;  // convert time to seconds

        while (delta >= STEP_SIZE) {
            delta -= STEP_SIZE;
            processInput(keys, boat);

            waves.update(time);
            boat.update(time);
            boatSound.volume = boat.speed * 0.75;

            light.target.position.x = boat.mesh.position.x;
            light.target.position.z = boat.mesh.position.z;
            light.position.x = light.target.position.x + 5;
            light.position.z = light.target.position.z - 10;
        }

        camera.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

}

main();

function processInput(keys: any, boat: Boat) {
    // Boat controls
    if (keys[Input.TurnLeft]) {
        boat.turnLeft();
    } else if (keys[Input.TurnRight]) {
        boat.turnRight();
    } else {
        boat.rudderStraight();
    }
    if (keys[Input.MoreSails]) {
        boat.accelerate();
    } else if (keys[Input.ReefSails]) {
        boat.decelerate();
    } else {
        boat.letGo();
    }
    if (keys[Input.TrimLeft]) {
        boat.trimLeft();
    }
    if (keys[Input.TrimRight]) {
        boat.trimRight();
    }
}