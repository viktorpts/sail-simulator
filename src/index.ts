import * as THREE from 'three';
import { makeBoat, makeSea, makeCube } from './models/modelMaker';

function main() {
    const keys: any = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
        w: false,
        a: false,
        s: false,
        d: false
    };
    const cameraPosition = {
        angle: 0,
        distance: 10
    };
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.addEventListener('keydown', (e) => keys[e.key] = true);
    canvas.addEventListener('keyup', (e) => keys[e.key] = false);
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 75;
    const aspect = 4 / 3;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.y = 5;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaccff);
    const ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient);
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 1, 4);
    scene.add(light);

    const cubes = [
        //makeCube(0x44FF44, 0),
        makeCube(0x4444FF, -4),
        makeCube(0xFF4444, 4)
    ];
    cubes.forEach(c => scene.add(c));

    const boat = makeBoat(0x44FF44);
    const sea = makeSea();
    scene.add(boat.mesh, sea.mesh);

    function render(time: number) {
        processInput(camera, cameraPosition, keys, boat);
        time *= 0.001;  // convert time to seconds

        cubes.slice(0, 1).forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });
        sea.update(time);
        boat.update(time);

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();

function processInput(camera: THREE.PerspectiveCamera, cameraPosition: any, keys: any, boat: { mesh: THREE.Mesh }) {
    if (keys.ArrowLeft) {
        cameraPosition.angle -= Math.PI / 100;
    }
    if (keys.ArrowRight) {
        cameraPosition.angle += Math.PI / 100;
    }
    if (keys.ArrowUp) {
        cameraPosition.distance -= 0.1;
    }
    if (keys.ArrowDown) {
        cameraPosition.distance += 0.1;
    }

    // Boat controls
    if (keys.a) {
        boat.mesh.rotation.y += Math.PI / 200;
    }
    if (keys.d) {
        boat.mesh.rotation.y -= Math.PI / 200;
    }
    if (keys.w) {
        const { x, z } = calculatePosition({distance: 0.1, angle: boat.mesh.rotation.y });
        boat.mesh.position.x += x;
        boat.mesh.position.z += z;
    }
    if (keys.s) {
        const { x, z } = calculatePosition({distance: -0.1, angle: boat.mesh.rotation.y });
        boat.mesh.position.x += x;
        boat.mesh.position.z += z;
    }

    const { x, z } = calculatePosition(cameraPosition);
    camera.position.x = boat.mesh.position.x + x;
    camera.position.z = boat.mesh.position.z + z;
    camera.lookAt(boat.mesh.position);
}

function calculatePosition(position: {distance: number, angle: number}) {
    const x = position.distance * Math.sin(position.angle);
    const z = position.distance * Math.cos(position.angle);
    return { x, z };
}