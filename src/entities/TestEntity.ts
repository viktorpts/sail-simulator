import GameEntity from "./GameEntity";
import TestComponent from "../components/TestComponent";

export default class TestEntity extends GameEntity {
    constructor(id: number) {
        super(id);
    }

    init(testComponent: TestComponent) {
        this.components[TestComponent.name] = testComponent;
    }
}


