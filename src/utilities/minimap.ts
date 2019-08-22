import { WORLD_WIDTH, WORLD_HEIGHT, WORLD_HSEGMENTS, WORLD_VSEGMENTS } from "../constants";


const lastMap = { x: 0, y: 0 };

export function updateMap(x: number, y: number, color: string) {
    if (x != lastMap.x || y != lastMap.y) {
        lastMap.x = x;
        lastMap.y = y;
        const mapX = Math.round(WORLD_HSEGMENTS * 0.5 - 0.5 + (x / WORLD_WIDTH * WORLD_HSEGMENTS));
        const mapY = Math.round(WORLD_VSEGMENTS * 0.5 - 0.5 + (y / WORLD_HEIGHT * WORLD_VSEGMENTS));
        const ctx = (<HTMLCanvasElement>document.getElementById('map')).getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(mapX, mapY, 1, 1);
    }
}