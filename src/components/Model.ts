import GameComponent from "./GameComponent";
import { Object3D } from "three";

export default class Model extends GameComponent {
    model: Object3D;
    tick: number = 0;
    
    constructor(model: Object3D, id: number, entityId: number) {
        super(id, entityId);
        this.model = model;
    }
}