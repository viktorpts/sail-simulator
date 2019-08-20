import * as THREE from 'three';
import { makeWaves, makeTerrain, makeSea, makeCompass } from './models/modelMaker';
import Boat from './models/Boat';
import { deltaFromAngle, generateHeight } from './util';
import { Input } from './CtrlScheme';
import { WORLD_HSEGMENTS, WORLD_VSEGMENTS} from './constants';

function main() {
    const keys: any = {
        [Input.Left]: false,
        [Input.Right]: false,
        [Input.Up]: false,
        [Input.Down]: false,
    };
    const cameraPosition = {
        angle: Math.PI / 3,
        distance: 10,
        height: 5
    };
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    document.addEventListener('keydown', (e) => keys[e.code] = true);
    document.addEventListener('keyup', (e) => keys[e.code] = false);
    document.addEventListener('wheel', (e) => zoom(cameraPosition, e.deltaY));
    document.addEventListener('mousedown', e => dragClick(e, keys, cameraPosition));
    document.addEventListener('mouseup', (e) => keys.mouse = false);
    document.addEventListener('mousemove', (e) => dragRotate(e, keys.mouse, cameraPosition));

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

    const fov = 75;
    const aspect = 4 / 3;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.y = 5;

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

    function render(time: number) {
        processInput(camera, cameraPosition, keys, boat);
        time *= 0.001;  // convert time to seconds

        waves.update(time);
        boat.update(time);
        boatSound.volume = boat.speed * 0.75;

        light.target.position.x = boat.mesh.position.x;
        light.target.position.z = boat.mesh.position.z;
        light.position.x = light.target.position.x + 5;
        light.position.z = light.target.position.z - 10;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();

function processInput(camera: THREE.PerspectiveCamera, cameraPosition: any, keys: any, boat: Boat) {
    if (keys[Input.Left]) {
        cameraPosition.angle += Math.PI / 100;
    }
    if (keys[Input.Right]) {
        cameraPosition.angle -= Math.PI / 100;
    }
    if (keys[Input.Up]) {
        zoomIn(cameraPosition);
    }
    if (keys[Input.Down]) {
        zoomOut(cameraPosition);
    }

    // Boat controls
    if (keys[Input.TurnLeft]) {
        boat.turnLeft();
    }
    if (keys[Input.TurnRight]) {
        boat.turnRight();
    }
    if (keys[Input.MoreSails]) {
        boat.accelerate();
    }
    if (keys[Input.ReefSails]) {
        boat.decelerate();
    }
    if (keys[Input.TrimLeft]) {
        boat.trimLeft();
    }
    if (keys[Input.TrimRight]) {
        boat.trimRight();
    }

    const { x, z } = deltaFromAngle(cameraPosition);
    camera.position.x = boat.mesh.position.x + x;
    camera.position.z = boat.mesh.position.z + z;
    camera.position.y = cameraPosition.height;
    camera.lookAt(boat.mesh.position.x, 2, boat.mesh.position.z);
}

function zoom(cameraPosition: any, deltaY: number) {
    if (deltaY < 0) {
        zoomIn(cameraPosition);
        zoomIn(cameraPosition);
        zoomIn(cameraPosition);
        zoomIn(cameraPosition);
        zoomIn(cameraPosition);
        zoomIn(cameraPosition);
        zoomIn(cameraPosition);
        zoomIn(cameraPosition);
    } else {
        zoomOut(cameraPosition);
        zoomOut(cameraPosition);
        zoomOut(cameraPosition);
        zoomOut(cameraPosition);
        zoomOut(cameraPosition);
        zoomOut(cameraPosition);
        zoomOut(cameraPosition);
        zoomOut(cameraPosition);
    }
}

function zoomIn(cameraPosition: any) {
    cameraPosition.distance -= 0.05 + Number((cameraPosition.distance / 150).toFixed(2));
}

function zoomOut(cameraPosition: any) {
    cameraPosition.distance += 0.05 + Number((cameraPosition.distance / 150).toFixed(2));
}

function dragClick(e: MouseEvent, keys: any, cameraPosition: any) {
    keys.mouse = true;
    cameraPosition.mouseX = e.clientX;
    cameraPosition.mouseY = e.clientY;
}

function dragRotate(e: MouseEvent, mode: boolean, cameraPosition: any) {
    if (mode) {
        const deltaX = cameraPosition.mouseX - e.clientX;
        cameraPosition.angle += Math.PI / 500 * deltaX;
        cameraPosition.mouseX = e.clientX;

        const deltaY = cameraPosition.mouseY - e.clientY;
        cameraPosition.height -= deltaY / 5;
        cameraPosition.mouseY = e.clientY;

    }
}