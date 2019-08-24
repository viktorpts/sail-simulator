import EntityManager from "../../src/utilities/EntityManager";
import GameEntity from "../../src/entities/GameEntity";
import TestEntity from "../../src/entities/TestEntity";
import GameComponent from "../../src/components/GameComponent";
import TestComponent from "../../src/components/TestComponent";
import TestSystem from "../../src/systems/TestSystem";

const item = new EntityManager();

const entitites: GameEntity[] = [
    new TestEntity(1000),
    new TestEntity(1001),
    new TestEntity(1002),
    { id: 2000, components: {}, init: () => { } },
    new TestEntity(1003),
];
const components: GameComponent[] = [
    new TestComponent(15, 1010, 1000),
    new TestComponent(25, 1011, 1001),
    new TestComponent(35, 1012, 1002),
    { id: 2010, entityId: 2000 },
    new TestComponent(45, 1013, 1003),
];
entitites[0].init(components[0]);
entitites[1].init(components[1]);
entitites[2].init(components[2]);
entitites[3].components.MismatchingType = components[3];
entitites[4].init(components[4]);
item.entitites.push(entitites[0]);
item.entitites.push(entitites[1]);
item.entitites.push(entitites[2]);
item.entitites.push(entitites[3]);
item.entitites.push(entitites[4]);

const system = new TestSystem();
item.systems.push(system);

const groupIndex = item.getIndexes(system.mask);
console.log('Output:');
console.log(groupIndex);