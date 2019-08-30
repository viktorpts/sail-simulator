import { DirectionalLight } from 'three';

export default class NauticalSun extends DirectionalLight {
    constructor() {
        super(0xFFFFFF, 1);
        new DirectionalLight();
        this.shadow.camera.left = -50;
        this.shadow.camera.right = 50;
        this.shadow.camera.top = 50;
        this.shadow.camera.bottom = -50;
        this.shadow.mapSize.height = 1024;
        this.shadow.mapSize.width = 1024;
        this.castShadow = true;
        this.position.set(10, 40, 20);
    }
}