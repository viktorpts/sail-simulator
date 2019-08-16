import * as THREE from 'three';
import MeshBuilder from '../render/MeshBuilder';

export function makeBoat(color: number) {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color }));
    model.addVertex(0, 1.3, 4);  // 0
    model.addVertex(1, 1, 1.5);  // 1
    model.addVertex(-1, 1, 1.5);  // 2
    model.addVertex(1, 1, -1.5);  // 3
    model.addVertex(-1, 1, -1.5);  // 4
    model.addVertex(0.5, 1.2, -3);  // 5
    model.addVertex(-0.5, 1.2, -3);  // 6
    model.addVertex(0, 0, 2);  // 7
    model.addVertex(0, 0, -2);  // 8
    // deck
    model.addFace(0, 1, 2);
    model.addFace(1, 3, 4);
    model.addFace(1, 4, 2);
    model.addFace(3, 5, 6);
    model.addFace(3, 6, 4);
    // bow
    model.addFace(0, 7, 1);
    model.addFace(0, 2, 7);
    // port side
    model.addFace(7, 8, 3);
    model.addFace(7, 3, 1);
    // starboard
    model.addFace(7, 2, 8);
    model.addFace(8, 2, 4);
    // aft
    model.addFace(8, 5, 3);
    model.addFace(8, 6, 5);
    model.addFace(8, 4, 6);

    return {
        mesh: model.mesh,
        update
    };

    function update(time: number) {
        model.mesh.rotation.z = Math.sin(time) / 10;
        model.mesh.position.y = (Math.sin(time) / 10) -0.3;
    }
}

export function makeSea() {
    const geometry = new THREE.PlaneBufferGeometry(100, 100, 127, 127);
    geometry.rotateX(- Math.PI / 2);
    const position = <THREE.BufferAttribute>geometry.attributes.position;
    position.dynamic = true;
    for (let i = 0; i < position.count; i++) {
        const y = 0.1 * (1 + Math.sin(i / 2));
        position.setY(i, y);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhongMaterial({ color: 0x0044ff });
    const mesh = new THREE.Mesh(geometry, material);

    return { mesh, position, update };

    function update(time: number) {
        for (let i = 0; i < position.count; i++) {
            const y = 0.1 * (1 + Math.sin(i / 5 + (time * 2 + i)));
            position.setY(i, y);
        }
        geometry.computeVertexNormals();
        position.needsUpdate = true;
    }
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

export function makeCube(color: number, x: number) {
    const material = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = x;

    return cube;
}