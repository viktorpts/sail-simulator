export default class GameComponent {
    private _id: number;
    private _entityId: number;

    constructor(id: number, entityId: number) {
        this._id = id;
        this._entityId = entityId;
    }

    get id() {
        return this._id;
    }

    get entityId() {
        return this._entityId;
    }
}