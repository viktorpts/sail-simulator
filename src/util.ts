export function deltaFromAngle(position: { distance: number, angle: number }) {
    const x = position.distance * Math.sin(position.angle);
    const z = position.distance * Math.cos(position.angle);
    return { x, z };
}