import * as THREE from 'three';
import { makeSea, makeCube, makeTerrain } from './models/modelMaker';
import Boat from './models/Boat';
import { deltaFromAngle } from './util';


function main() {
    const keys: any = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
        w: false,
        a: false,
        s: false,
        d: false,
        _speed: 0
    };
    const cameraPosition = {
        angle: Math.PI / 3,
        distance: 10
    };
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    document.addEventListener('keydown', (e) => keys[e.key] = true);
    document.addEventListener('keyup', (e) => keys[e.key] = false);

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

    /*
    const cubes = [
        //makeCube(0x44FF44, 0),
        makeCube(0x4444FF, -4),
        makeCube(0xFF4444, 4)
    ];
    cubes.forEach(c => scene.add(c));
    */

    const boat = new Boat();
    const sea = makeSea();
    const terrain = makeTerrain();
    terrain.position.y = -20;
    scene.add(boat.mesh);
    scene.add(terrain);
    for (let x = -10; x < 10; x++) {
        for (let y = -10; y < 10; y++) {
            scene.add(sea.getOffset(x, y));
        }
    }

    function render(time: number) {
        processInput(camera, cameraPosition, keys, boat);
        time *= 0.001;  // convert time to seconds

        /*
        cubes.slice(0, 1).forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });
        */
        sea.update(time);
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
    if (keys.ArrowLeft) {
        cameraPosition.angle += Math.PI / 100;
    }
    if (keys.ArrowRight) {
        cameraPosition.angle -= Math.PI / 100;
    }
    if (keys.ArrowUp) {
        cameraPosition.distance -= 0.05 + Number((cameraPosition.distance / 200).toFixed(2));
    }
    if (keys.ArrowDown) {
        cameraPosition.distance += 0.05 + Number((cameraPosition.distance / 200).toFixed(2));
    }

    // Boat controls
    if (keys.a) {
        boat.turnLeft();
    }
    if (keys.d) {
        boat.turnRight();
    }
    if (keys.w) {
        boat.accelerate();
    }
    if (keys.s) {
        boat.decelerate();
    }

    const { x, z } = deltaFromAngle(cameraPosition);
    camera.position.x = boat.mesh.position.x + x;
    camera.position.z = boat.mesh.position.z + z;
    camera.position.y = cameraPosition.distance - 5;
    camera.lookAt(boat.mesh.position.x, 2, boat.mesh.position.z);
}