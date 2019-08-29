import GameEntity from "./GameEntity";
import TerrainCollider from "../components/TerrainCollider";

export default class Terrain extends GameEntity {
    init(collider: TerrainCollider) {
        this.components[TerrainCollider.name] = collider;
    }
}