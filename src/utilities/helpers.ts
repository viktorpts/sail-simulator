export function clamp(value: number, min: number, max: number) {
    if (value < min) return min;
    else if (value > max) return max;
    else return value;
}

export function wrap(value: number, min: number, max: number) {
    if (value < min) return value + (max - min);
    else if (value >= max) return value - (max - min);
    else return value;
}

export function deltaFromAngle(position: { distance: number, angle: number }) {
    const x = position.distance * Math.sin(position.angle);
    const y = position.distance * Math.cos(position.angle);
    return { x, y };
}