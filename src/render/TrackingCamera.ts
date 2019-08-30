import { PerspectiveCamera, Object3D } from 'three';

const fov = 75;
const aspect = 4 / 3;
const near = 0.5;
const far = 2000;

export default class TrackingCamera extends PerspectiveCamera {
    private target: Object3D;
    private direction: number = 0;
    private elevation: number = 0;
    private distance: number = 10;
    private dragging: boolean = false;
    private mousePos = { x: 0, y: 0 };

    constructor(target: Object3D) {
        super(fov, aspect, near, far);
        this.target = target;
    }

    update() {
        const x = this.distance * Math.sin(this.direction) * Math.sin(this.elevation);
        const y = this.distance * Math.cos(this.direction) * Math.sin(this.elevation);
        const z = this.distance * Math.cos(this.elevation);
        this.position.x = this.target.position.x + x;
        this.position.y = this.target.position.y + y;
        this.position.z = z + 2;
        this.lookAt(this.target.position.x, this.target.position.y, 2);
    }

    dragRotate(angle: number) {
        this.direction -= angle;
        if (this.direction > Math.PI * 2) {
            this.direction = this.direction - Math.PI * 2;
        } else if (this.direction < 0) {
            this.direction = this.direction + Math.PI * 2;
        }
    }

    dragElevate(angle: number) {
        if (this.elevation + angle > Math.PI * 0.5) {
            this.elevation = Math.PI * 0.5;
        } else if (this.elevation + angle < 0.1) {
            this.elevation = 0.1;
        } else {
            this.elevation += angle;
        }
    }

    moveIn(delta = 1) {
        this.distance -= (0.05 + Number((this.distance * 0.01).toFixed(2))) * delta;
    }

    moveOut(delta = 1) {
        this.distance += (0.05 + Number((this.distance * 0.01).toFixed(2))) * delta;
    }

    onWheel(e: MouseWheelEvent) {
        if (e.deltaY < 0) {
            this.moveIn(10);
        } else {
            this.moveOut(10);
        }
    }

    onMouseDown(e: MouseEvent) {
        this.dragging = true;
        this.mousePos.x = e.clientX;
        this.mousePos.y = e.clientY;
    }

    onMouseUp(e: MouseEvent) {
        this.dragging = false;
    }

    onMouseMove(e: MouseEvent) {
        if (this.dragging) {
            const deltaX = (this.mousePos.x - e.clientX) * 0.01;
            this.mousePos.x = e.clientX;
            this.dragRotate(deltaX);

            const deltaY = (this.mousePos.y - e.clientY) * 0.01;
            this.mousePos.y = e.clientY;
            this.dragElevate(deltaY);
        }
    }
}