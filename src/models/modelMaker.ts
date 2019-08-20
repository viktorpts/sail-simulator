import * as THREE from 'three';
import MeshBuilder from './MeshBuilder';
import { generateHeight } from '../util';


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

export function makeMainsail() {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color: 0xe8e5d1 }));
    model.addVertex(0, 1.5, 0);     // 0
    model.addVertex(0, 5.5, 0);     // 1
    model.addVertex(0, 6.5, -1.5);  // 2
    model.addVertex(0, 1.5, -3);  // 3

    model.addFace(0, 1, 2);
    model.addFace(0, 2, 3);
    model.addFace(0, 2, 1);
    model.addFace(0, 3, 2);

    model.mesh.castShadow = true;
    model.mesh.receiveShadow = true;
    return model;
}

export function makeHeadsail() {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color: 0xe8e5d1 }));
    model.addVertex(0, -5.8, 0);  // 0
    model.addVertex(0, 0, 0);  // 1
    model.addVertex(0, -4.5, -2);  // 2

    model.addFace(0, 1, 2);
    model.addFace(0, 2, 1);

    model.mesh.castShadow = true;
    model.mesh.receiveShadow = true;
    return model;
}

export function makeWaves() {
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
    const material = new THREE.MeshStandardMaterial({ color: 0x1c2f63, transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    return { mesh, update, getOffset };

    function update(time: number) {
        for (let col = 0; col <= qxc; col++) {
            for (let row = 0; row <= qxc; row++) {
                const i = row * (qxc + 1) + col;

                if (col == qxc) {
                    const y = position.getY(i - col);
                    position.setY(i, y);
                } else if (row == qxc) {
                    const y = position.getY(i - row * (qxc + 1));
                    position.setY(i, y);
                } else {
                    const mainWave = (1 + Math.sin(i / 5 + (time * 3 + i))) * 0.5;
                    const secondaryWave = (1 + Math.sin(i / 5 + (time * 10 + i))) * 0.5;
                    const xWave = (1 + Math.sin(time * 10 + col)) * 0.5;
                    const yWave = (1 + Math.sin(time * 10 + row)) * 0.5;
                    const y = mainWave * 0.1 + secondaryWave * 0.05 + xWave * 0.05 + yWave * 0.05;
                    position.setY(i, y);
                }
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

export function makeSea(data: Int16Array, width: number, height: number) {
    var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 16, 16);
    geometry.rotateX(- Math.PI / 2);
    
    const texture = new THREE.CanvasTexture(generateTexture(data, width, height));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
    mesh.position.y = -0.1;

    return mesh;


    function generateTexture(data: Int16Array, width: number, height: number) {
        //const z = 50;
        //const biomes = generateHeight(width, height, z);
        var canvas, canvasScaled, context, image, imageData;
        canvas = document.createElement('canvas');
        canvas.id = 'map';
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);
        image = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = image.data;
        for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
            if (data[j] <= 74) {
                //*
                imageData[i] = 28;
                imageData[i + 1] = 47;
                imageData[i + 2] = 99;
            } else {
                imageData[i] = 255;
                imageData[i + 1] = 255;
                imageData[i + 2] = 255;
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

export function makeTerrain(data: Int16Array, worldWidth: number, worldDepth: number) {
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
    mesh.position.y = -38;

    return mesh;


    function generateTexture(data: Int16Array, width: number, height: number) {
        const z = 50;
        const biomes = generateHeight(width, height, z);
        var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;
        vector3 = new THREE.Vector3(0, 0, 0);
        sun = new THREE.Vector3(5, 10, -10);
        sun.normalize();
        canvas = document.createElement('canvas');
        canvas.id = 'map';
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);
        image = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = image.data;
        for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
            const blendAmt = Math.min((biomes[j] > 50 ? biomes[j] - 50 : 0), 25) / 25;

            vector3.x = data[j - 2] - data[j + 2];
            vector3.y = 2;
            vector3.z = data[j - width * 2] - data[j + width * 2];
            vector3.normalize();
            shade = vector3.dot(sun);
            const heightModifier = (0.5 + data[j] * 0.007);
            
            if (data[j] <= 74) {
                //*
                imageData[i] = 28;
                imageData[i + 1] = 47;
                imageData[i + 2] = 99;
                //*/
                /*
                imageData[i] = illuminate(28, shade);
                imageData[i + 1] = illuminate(47, shade);
                imageData[i + 2] = illuminate(99, shade);
                */
            } else if (data[j] <= 80) {
                imageData[i] = illuminate(212, shade);
                imageData[i + 1] = illuminate(187, shade);
                imageData[i + 2] = illuminate(121, shade);
            } else {
                imageData[i] = illuminate(blend(37, biomes[j], blendAmt), shade) * heightModifier;
                imageData[i + 1] = illuminate(blend(105, biomes[j], blendAmt), shade) * heightModifier;
                imageData[i + 2] = illuminate(blend(37, biomes[j], blendAmt), shade) * heightModifier;
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
        document.body.appendChild(canvas);
        return canvasScaled;

        function grade(min: number, max: number, value: number) {
            return min + value * (max - min);
        }

        function illuminate(color: number, shade: number) {
            return grade(Math.floor(color * 0.65), color, shade);
        }

        function blend(a: number, b: number, cent: number) {
            return (a * (1 - cent) + b * cent) * 0.5;
        }
    }
}