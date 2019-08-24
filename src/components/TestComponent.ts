import GameComponent from "./GameComponent";

export default class TestComponent extends GameComponent {
    testValue: number;

    constructor(testValue: number, id: number, entityId: number) {
        super(id, entityId);
        this.testValue = testValue;
    }
}