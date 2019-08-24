export default abstract class GameComponent {
    readonly id: number;
    readonly entityId: number;

    constructor(id: number, entityId: number) {
        this.id = id;
        this.entityId = entityId;
    }
}
