import GameComponent from "./GameComponent";

export default class TerrainCollider extends GameComponent {
    heighMap: Int16Array;

    constructor(heightMap: Int16Array,  id: number, entityId: number) {
        super(id, entityId);
        this.heighMap = heightMap;
    }
}