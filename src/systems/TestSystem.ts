import GameSystem from "./GameSystem";
import { IndexById } from "../utilities/Collections";
import TestComponent from "../components/TestComponent";
import GameComponent from "../components/GameComponent";

export default class TestSystem implements GameSystem {
    readonly mask = {
        testEntities: {
            testComponent: {
                type: TestComponent,
                required: true
            }
        }
    };

    parse(
        entities: {
            testEntities: {
                [index: string]: { testComponent: TestComponent }
            }
        },
        components: { testComponents: TestComponent[] },
        componentsById?: IndexById<GameComponent>
    ) {
        for (let id of Object.keys(entities.testEntities)) {
            const entity = entities.testEntities[id];
            entity.testComponent.testValue++;
        }
    }
}