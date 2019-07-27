import * as THREE from 'three';


function main() {
    const keys: any = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
    };
    const cameraPosition = {
        angle: 0,
        distance: 5
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
    camera.position.y = 2;

    const scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    const geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-1, -1, 1),  // 0
        new THREE.Vector3(1, -1, 1),  // 1
        new THREE.Vector3(-1, 1, 1),  // 2
        new THREE.Vector3(1, 1, 1),  // 3
        new THREE.Vector3(-1, -1, -1),  // 4
        new THREE.Vector3(1, -1, -1),  // 5
        new THREE.Vector3(-1, 1, -1),  // 6
        new THREE.Vector3(1, 1, -1),  // 7
    );
    geometry.faces.push(
        // front
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 1, 3),
        // right
        new THREE.Face3(1, 7, 3),
        new THREE.Face3(1, 5, 7),
        // back
        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),
        // left
        new THREE.Face3(4, 2, 6),
        new THREE.Face3(4, 0, 2),
        // top
        new THREE.Face3(2, 7, 6),
        new THREE.Face3(2, 3, 7),
        // bottom
        new THREE.Face3(4, 1, 0),
        new THREE.Face3(4, 5, 1),
    );
    geometry.computeFaceNormals();

    function makeInstance(geometry: any, color: number, x: number) {
        const material = new THREE.MeshPhongMaterial({ color });

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        return cube;
    }

    const cubes = [
        makeInstance(geometry, 0x44FF44, 0),
        makeInstance(geometry, 0x4444FF, -4),
        makeInstance(geometry, 0xFF4444, 4)
    ];

    function render(time: number) {
        processInput(camera, cameraPosition, keys);
        time *= 0.001;  // convert time to seconds

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();

function processInput(camera: THREE.PerspectiveCamera, cameraPosition: any, keys: any) {
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

    const {x, z} = calculatePosition(cameraPosition);
    camera.position.x = x;
    camera.position.z = z;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function calculatePosition(position: any) {
    const x = position.distance * Math.sin(position.angle);
    const z = position.distance * Math.cos(position.angle);
    return { x, z };
}