import * as THREE from 'three';
import Boat from './models/Boat';
import { Input } from './CtrlScheme';
import { STEP_SIZE } from './constants';
import { Sound } from './components/sound';
import NauticalScene from './models/NauticalScene';

function main() {
    const keys: any = {};
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    document.addEventListener('keydown', (e) => keys[e.code] = true);
    document.addEventListener('keyup', (e) => keys[e.code] = false);

    const seaAmbience = new Sound('audio/sea.mp3');
    seaAmbience.volume = 0.25;
    seaAmbience.loop = true;
    const boatSound = new Sound('audio/surf.mp3');
    boatSound.volume = 0.1;
    boatSound.loop = true;

    seaAmbience.play();
    boatSound.play();


    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.shadowMap.enabled = true;

    const scene = new NauticalScene();

    let lastUpdate = performance.now();
    let delta = 0;

    document.addEventListener('wheel', scene.camera.onWheel.bind(scene.camera));
    document.addEventListener('mousedown', scene.camera.onMouseDown.bind(scene.camera));
    document.addEventListener('mouseup', scene.camera.onMouseUp.bind(scene.camera));
    document.addEventListener('mousemove', scene.camera.onMouseMove.bind(scene.camera));
    scene.camera.dragRotate(Math.PI / 3);
    scene.camera.dragElevate(Math.PI/ 4);

    requestAnimationFrame(render);

    function render(time: number) {
        processInput(keys, scene.actor);

        delta += time - lastUpdate;
        lastUpdate = time;
        time *= 0.001;  // convert time to seconds
        while (delta >= STEP_SIZE) {
            delta -= STEP_SIZE;
            scene.step(time);
        }

        boatSound.volume = scene.actor.speed * 0.75;
        scene.camera.update();

        renderer.render(scene, scene.camera);
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