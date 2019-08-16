import * as THREE from 'three';
import MeshBuilder from './MeshBuilder';
import { ImprovedNoise } from './ImprovedNoise';

export function makeBoat(color: number) {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color }));
    // hull vertices
    model.addVertex(0, 1.3, 4);  // 0
    model.addVertex(1, 1, 1.5);  // 1
    model.addVertex(-1, 1, 1.5);  // 2
    model.addVertex(1, 1, -1.5);  // 3
    model.addVertex(-1, 1, -1.5);  // 4
    model.addVertex(0.5, 1.2, -3);  // 5
    model.addVertex(-0.5, 1.2, -3);  // 6
    model.addVertex(0, 0, 2);  // 7
    model.addVertex(0, 0, -2);  // 8
    // mast vertices
    model.addVertex(-0.1, 1, 1);  // 9
    model.addVertex(0, 1, 0.9);  // 10
    model.addVertex(0.1, 1, 1);  // 11
    model.addVertex(0, 1, 1.1);  // 12
    model.addVertex(0, 7, 1);  // 13

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
    // mast
    model.addFace(10, 9, 13);
    model.addFace(11, 10, 13);
    model.addFace(12, 11, 13);
    model.addFace(9, 12, 13);

    model.mesh.castShadow = true;
    model.mesh.receiveShadow = true;
    return model;
}

export function makeSails() {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color: 0xe8e5d1 }));
    // Main sail
    model.addVertex(0, 1.5, 1);     // 0
    model.addVertex(0, 5.5, 1);     // 1
    model.addVertex(1, 6.5, -0.5);  // 2
    model.addVertex(2, 1.5, -2);  // 3

    model.addFace(0, 1, 2);
    model.addFace(0, 2, 3);
    model.addFace(0, 2, 1);
    model.addFace(0, 3, 2);

    // Head sail
    model.addVertex(0, 1.3, 4);  // 4
    model.addVertex(0, 6.5, 1);  // 5
    model.addVertex(1.5, 2, 1.5);  // 6

    model.addFace(4, 5, 6);
    model.addFace(5, 4, 6);

    model.mesh.castShadow = true;
    model.mesh.receiveShadow = true;
    return model;
}

export function makeSea() {
    const qxc = 100;

    const geometry = new THREE.PlaneBufferGeometry(qxc, qxc, qxc, qxc);
    //const geometry = new THREE.BufferGeometry();
    //geometry.fromGeometry(new THREE.PlaneGeometry(qxc, qxc, qxc, qxc));
    geometry.rotateX(- Math.PI / 2);
    const position = <THREE.BufferAttribute>geometry.attributes.position;
    position.dynamic = true;
    for (let i = 1; i < position.count; i++) {
        const y = 0.1 * (1 + Math.sin(i / 2));
        position.setY(i, y);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhongMaterial({ color: 0x1c2f63 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    return { mesh, update, getOffset };

    function update(time: number) {
        for (let i = 0; i < position.count; i++) {
            if ((i + 1) % (qxc + 1) == 0) {
                const y = position.getY(i - qxc);
                position.setY(i, y);
            } else if (i >= (qxc + 1) * qxc) {
                const y = position.getY(i - (qxc + 1) * qxc);
                position.setY(i, y);
            } else {
                const y = 0.1 * (1 + Math.sin(i / 5 + (time * 3 + i)));
                position.setY(i, y);
            }
        }
        geometry.computeVertexNormals();
        position.needsUpdate = true;
    }

    function getOffset(x: number, z: number) {
        const newMesh = new THREE.Mesh(geometry, material);
        newMesh.position.x += x * qxc;
        newMesh.position.z += z * qxc;
        newMesh.receiveShadow = true;
        return newMesh
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

export function makeTerrain() {
    const worldWidth = 256;
    const worldDepth = 256;
    const data = generateHeight(worldWidth, worldDepth);
    var geometry = new THREE.PlaneBufferGeometry(2000, 2000, worldWidth - 1, worldDepth - 1);
    geometry.rotateX(- Math.PI / 2);
    var vertices = <Array<number>>(<THREE.BufferAttribute>geometry.attributes.position).array;
    for (var i = 0, j = 0, l = vertices.length; i < l; i++ , j += 3) {
        vertices[j + 1] = data[i] / 2;
    }
    //geometry.computeVertexNormals();

    const texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));

    return mesh;

    function generateHeight(width: number, height: number) {
        const size = width * height;
        const data = new Uint8Array(size);
        const perlin: { noise: Function } = ImprovedNoise();
        let quality = 1;
        const z = 150;

        for (var j = 0; j < 4; j++) {
            for (var i = 0; i < size; i++) {
                var x = i % width, y = ~ ~(i / width);
                data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
            }
            quality *= 5;
        }
        return data;
    }

    function generateTexture(data: Uint8Array, width: number, height: number) {
        var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;
        vector3 = new THREE.Vector3(0, 0, 0);
        sun = new THREE.Vector3(5, 10, -10);
        sun.normalize();
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);
        image = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = image.data;
        for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
            vector3.x = data[j - 2] - data[j + 2];
            vector3.y = 2;
            vector3.z = data[j - width * 2] - data[j + width * 2];
            vector3.normalize();
            shade = vector3.dot(sun);
            const heightModifier = (0.5 + data[j] * 0.007);
            imageData[i] = (21 + shade * 16) * heightModifier; // 21 - 37
            imageData[i + 1] = (91 + shade * 14) * heightModifier; // 91 - 105
            imageData[i + 2] = (21 + shade * 16) * heightModifier; // 21 - 37

            /*
            if (data[j] < 41) {
                imageData[i] = (28 + (data[j] - 40) * 151); // 28 - 179
                imageData[i + 1] = (47 + (data[j] - 40) * 165); // 47 - 212
                imageData[i + 2] = (99 + (data[j] - 40) * 131); // 99 - 230
            } else*/ if (data[j] < 45) {
                imageData[i] = (138 + shade * 74); // 138 - 212
                imageData[i + 1] = (121 + shade * 66); // 121 - 187
                imageData[i + 2] = (76 + shade * 45); // 76 - 121
            }
        }
        context.putImageData(image, 0, 0);
        // Scaled 4x
        canvasScaled = document.createElement('canvas');
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;
        context = canvasScaled.getContext('2d');
        context.scale(4, 4);
        context.drawImage(canvas, 0, 0);
        image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
        imageData = image.data;
        for (var i = 0, l = imageData.length; i < l; i += 4) {
            var v = ~ ~(Math.random() * 5);
            imageData[i] += v;
            imageData[i + 1] += v;
            imageData[i + 2] += v;
        }
        context.putImageData(image, 0, 0);
        return canvasScaled;
    }
}