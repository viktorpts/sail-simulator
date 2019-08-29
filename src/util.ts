import { noise, seed } from './perlin';


export function deltaFromAngle(position: { distance: number, angle: number }) {
    const x = position.distance * Math.sin(position.angle);
    const z = position.distance * Math.cos(position.angle);
    return { x, z };
}

export function generateHeight(width: number, height: number, z: number) {
    seed(z);
    const size = width * height;
    const data = new Int16Array(size);

    // Main elevation
    for (let i = 0; i < size; i++) {
        const x = i % width, y = ~ ~(i / width);
        data[i] = Math.abs(noise(x / 250, y / 250) * 100);
        //data[i] = noise(x / 250, y / 250) * 100;
    }
    for (let i = 0; i < size; i++) {
        const x = i % width, y = ~ ~(i / width);
        data[i] += noise(x / 125, y / 125) * 25;
    }

    // Ridges
    for (let i = 0; i < size; i++) {
        const x = i % width, y = ~ ~(i / width);
        data[i] += Math.abs(noise(x / 50, y / 50) * 50);
    }

    // Detail map
    let quality = 2;
    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width, y = ~ ~(i / width);
            data[i] += Math.abs(noise(x / quality, y / quality) * quality * 0.5);
            data[i] += noise(x / quality, y / quality) * quality * 0.5;
        }
        quality *= 10;
    }

    // Smooth shore
    /*
    const shore: number[] = [];
    for (let i = 0; i < size; i++) {
        if (data[i] >= 75 && data[i] <= 77) {
            shore.push(i);
        }
    }
    for (let index of shore) {
        smooth(data, index, width, size);
    }
    */
   smoothShoreline(data, size);

    return data;
}

function smoothShoreline(data: Int16Array, size: number) {
    for (let i = 0; i < size; i++) {
        if (data[i] >= 66 && data[i] <= 86) {
            const offset = (data[i] - 76) / 10;
            const modifier = Math.sin(offset*Math.PI);
            data[i] -= modifier * 3;
        }
    }
}

function smooth(data: Int16Array, index: number, width: number, size: number) {
    const values: number[] = [];
    for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
            if ((x == -2 || x == 2) && (y == -2 || y == 2)) {
                continue;
            } else {
                const i = index + x + y * width;
                if (i >= 0 && i < size) {
                    values.push(data[i]);
                }
            }
        }
    }
    data[index] = Math.floor(values.reduce((p, c) => p + c, 0) / values.length);
}

function getIndex(x: number, y: number, w: number) {
    return x + y * w;
}

function getCoord(index: number, width: number) {
    const y = Math.floor(index / width);
    const x = index - y;
    return [x, y];
}

/*
const debugDiv= document.getElementById('debug');

export function print(data: string) {
    debugDiv.textContent = data;
}
*/