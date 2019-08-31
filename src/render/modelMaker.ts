import * as THREE from 'three';
import MeshBuilder from './MeshBuilder';
import { generateHeight } from '../util';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { Water } from './lib/Water2';


export function makeBoat(color: number) {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color }));
    // hull vertices
    model.addVertex(0, 4, 1.3);  // 0
    model.addVertex(-1, 1.5, 1);  // 1
    model.addVertex(1, 1.5, 1);  // 2
    model.addVertex(-1, -1.5, 1);  // 3
    model.addVertex(1, -1.5, 1);  // 4
    model.addVertex(-0.5, -3, 1.2);  // 5
    model.addVertex(0.5, -3, 1.2);  // 6
    model.addVertex(0, 2, 0);  // 7
    model.addVertex(0, -2, 0);  // 8
    // mast vertices
    model.addVertex(0.1, 1, 1);  // 9
    model.addVertex(0, 0.9, 1);  // 10
    model.addVertex(-0.1, 1, 1);  // 11
    model.addVertex(0, 1.1, 1);  // 12
    model.addVertex(0, 1, 7);  // 13

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

export function makeRudder(color: number) {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color }));
    model.addVertex(0, 0, 0);    // 0
    model.addVertex(0, -0.5, 0); // 1
    model.addVertex(0, -1, -1);  // 2
    model.addVertex(0, 0, -1);   // 3

    model.addFace(0, 1, 2);
    model.addFace(0, 2, 3);
    model.addFace(0, 2, 1);
    model.addFace(0, 3, 2);

    model.mesh.castShadow = true;
    model.mesh.receiveShadow = true;
    return model;
}

export function makeMainsail() {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color: 0xe8e5d1, side: THREE.DoubleSide }));
    model.addVertex(0, 0, 0);             // 0 front bottom
    model.addVertex(0, 0, 4);             // 1 front top
    model.addVertex(0, -1.5, 5);          // 2 back top
    model.addVertex(-0.75, -1.875, 3.75); // 3
    model.addVertex(-1, -2.25, 2.5);      // 4
    model.addVertex(-0.75, -2.625, 1.25); // 5
    model.addVertex(0, -3, 0);            // 6 back bottom

    model.addFace(0, 1, 2);
    model.addFace(0, 2, 3);
    model.addFace(0, 3, 4);
    model.addFace(0, 4, 5);
    model.addFace(0, 5, 6);

    /*
    model.addFace(0, 2, 1);
    model.addFace(0, 3, 2);
    model.addFace(0, 4, 3);
    model.addFace(0, 5, 4);
    model.addFace(0, 6, 5);
    */

    model.mesh.castShadow = true;
    model.mesh.receiveShadow = true;
    return model;
}

export function makeHeadsail() {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color: 0xe8e5d1, side: THREE.DoubleSide }));
    model.addVertex(0, 0, -6);  // 0 front bottom
    model.addVertex(0, 0, 0);  // 1 front top
    model.addVertex(-0.6, -0.7, -1.5);  // 2
    model.addVertex(-0.6, -1.4, -3);  // 3
    model.addVertex(0, -2.1, -4.5);  // 4 back
    model.addVertex(-0.2, -1.4, -5);  // 5
    model.addVertex(-0.2, -0.7, -5.5);  // 6

    model.addFace(0, 1, 2);
    model.addFace(0, 2, 6);
    model.addFace(6, 2, 3);
    model.addFace(6, 3, 5);
    model.addFace(5, 3, 4);

    /*
    model.addFace(0, 2, 1);
    model.addFace(0, 6, 2);
    model.addFace(6, 3, 2);
    model.addFace(6, 5, 3);
    model.addFace(5, 4, 3);
    */

    model.mesh.castShadow = true;
    model.mesh.receiveShadow = true;
    return model;
}

export function makeWaterflow() {
    const params = {
        color: '#ffffff',
        scale: 500,
        flowX: 1,
        flowY: 1
    };
    
    const waterGeometry = new THREE.PlaneBufferGeometry(WORLD_WIDTH, WORLD_WIDTH);
    const water = new Water(waterGeometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2(params.flowX, params.flowY),
        textureWidth: 1024,
        textureHeight: 1024
    });
    water.position.z = 0.05;
    return water;
}

export function makeWaves() {
    const qxc = 100;

    const geometry = new THREE.PlaneBufferGeometry(qxc, qxc, qxc, qxc);
    const position = <THREE.BufferAttribute>geometry.attributes.position;
    position.dynamic = true;
    for (let i = 1; i < position.count; i++) {
        const z = 0.1 * (1 + Math.sin(i / 2));
        position.setZ(i, z);
    }
    geometry.computeVertexNormals();
    const waterMap = (new THREE.TextureLoader()).load('water.jpg');
    waterMap.wrapS = THREE.RepeatWrapping;
    waterMap.wrapT = THREE.RepeatWrapping;
    waterMap.repeat = new THREE.Vector2(10, 10);
    const material = new THREE.MeshStandardMaterial({ color: 0x1c2f63, transparent: true, opacity: 0.5, map: waterMap, bumpMap: waterMap, bumpScale: 0.1 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    return { mesh, update, getOffset };

    function update(time: number) {
        for (let col = 0; col <= qxc; col++) {
            for (let row = 0; row <= qxc; row++) {
                const i = row * (qxc + 1) + col;

                if (col == qxc) {
                    const z = position.getZ(i - col);
                    position.setZ(i, z);
                } else if (row == qxc) {
                    const z = position.getZ(i - row * (qxc + 1));
                    position.setZ(i, z);
                } else {
                    const mainWave = (1 + Math.sin(i / 5 + (time * 3 + i))) * 0.5;
                    const secondaryWave = (1 + Math.sin(i / 5 + (time * 10 + i))) * 0.5;
                    const xWave = (1 + Math.sin(time * 10 + col)) * 0.5;
                    const yWave = (1 + Math.sin(time * 10 + row)) * 0.5;
                    const z = mainWave * 0.1 + secondaryWave * 0.05 + xWave * 0.05 + yWave * 0.05;
                    position.setZ(i, z);
                }
            }
        }
        geometry.computeVertexNormals();
        position.needsUpdate = true;
    }

    function getOffset(x: number, y: number) {
        const newMesh = new THREE.Mesh(geometry, material);
        newMesh.position.x += x * qxc;
        newMesh.position.y += y * qxc;
        newMesh.receiveShadow = true;
        return newMesh
    }
}

export function makeSea(data: Int16Array, width: number, height: number) {
    var geometry = new THREE.PlaneBufferGeometry(WORLD_WIDTH, WORLD_HEIGHT, 16, 16);
    //geometry.rotateX(- Math.PI / 2);

    const texture = new THREE.CanvasTexture(generateTexture(data, width, height));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.5 }));
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
    var geometry = new THREE.PlaneBufferGeometry(WORLD_WIDTH, WORLD_HEIGHT, worldWidth - 1, worldDepth - 1);
    //geometry.rotateX(- Math.PI / 2);
    var vertices = <Array<number>>(<THREE.BufferAttribute>geometry.attributes.position).array;
    for (var i = 0, j = 0, l = vertices.length; i < l; i++ , j += 3) {
        vertices[j + 2] = data[i] / 2;
    }
    //geometry.computeVertexNormals();

    const texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
    mesh.position.z = -38;

    return mesh;


    function generateTexture(data: Int16Array, width: number, height: number) {
        const z = 50;
        const biomes = generateHeight(width, height, z);
        var canvas, canvasScaled, context, image, imageData, vector3, sun, shade, mapCanvas;
        vector3 = new THREE.Vector3(0, 0, 0);
        sun = new THREE.Vector3(5, 10, -10);
        sun.normalize();

        // Initialize mini-map canvas
        mapCanvas = document.createElement('canvas');
        mapCanvas.id = 'map';
        mapCanvas.width = width;
        mapCanvas.height = height;
        const mapContext = mapCanvas.getContext('2d');
        mapContext.fillStyle = '#000';
        mapContext.fillRect(0, 0, width, height);
        const mapImage = mapContext.getImageData(0, 0, mapCanvas.width, mapCanvas.height);
        const mapImageData = mapImage.data;
        document.getElementById('output').appendChild(mapCanvas);

        // Initialize texture canvas
        canvas = document.createElement('canvas');
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
                imageData[i] = illuminate(blend(28, 212, data[j] / 74), shade);
                imageData[i + 1] = illuminate(blend(47, 187, data[j] / 74), shade);
                imageData[i + 2] = illuminate(blend(99, 121, data[j] / 74), shade);

                mapImageData[i] = blend(28, 42, data[j] / 74);
                mapImageData[i + 1] = blend(47, 70, data[j] / 74);
                mapImageData[i + 2] = blend(99, 149, data[j] / 74);
            } else if (data[j] <= 80) {
                imageData[i] = illuminate(212, shade);
                imageData[i + 1] = illuminate(187, shade);
                imageData[i + 2] = illuminate(121, shade);

                mapImageData[i] = illuminate(212, shade);
                mapImageData[i + 1] = illuminate(187, shade);
                mapImageData[i + 2] = illuminate(121, shade);
            } else {
                imageData[i] = illuminate(blend(37, biomes[j], blendAmt), shade) * heightModifier;
                imageData[i + 1] = illuminate(blend(105, biomes[j], blendAmt), shade) * heightModifier;
                imageData[i + 2] = illuminate(blend(37, biomes[j], blendAmt), shade) * heightModifier;

                mapImageData[i] = illuminate(blend(37, biomes[j], blendAmt), shade) * heightModifier;
                mapImageData[i + 1] = illuminate(blend(105, biomes[j], blendAmt), shade) * heightModifier;
                mapImageData[i + 2] = illuminate(blend(37, biomes[j], blendAmt), shade) * heightModifier;
            }
        }
        context.putImageData(image, 0, 0);
        mapContext.putImageData(mapImage, 0, 0);

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

export function makeCompass() {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color: 0xffffff }));
    model.addVertex(0, 5, 0);  // 0 Up
    model.addVertex(-5, 0, 0); // 1 Left
    model.addVertex(0, -5, 0); // 2 Down
    model.addVertex(5, 0, 0);  // 3 Right

    // North
    model.addVertex(0, 15, 0); // 4
    model.addFace(1, 0, 4);
    model.addFace(3, 4, 0);

    return model.mesh;
}

export function makeArrow(color = 0xffffff) {
    const model = new MeshBuilder(new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide }));
    model.addVertex(-0.1, 1, 0); // 0 
    model.addVertex(0.1, 1, 0);  // 1
    model.addVertex(0.1, 0, 0);  // 2
    model.addVertex(-0.1, 0, 0); // 3

    // North
    model.addFace(0, 1, 2);
    model.addFace(0, 2, 3);

    return model.mesh;
}