import { expect } from 'chai';
import 'mocha';
import EntityManager from '../../src/utilities/EntityManager';
import TestEntity from '../../src/entities/TestEntity';
import TestComponent from '../../src/components/TestComponent';
import TestSystem from '../../src/systems/TestSystem';
import GameEntity from '../../src/entities/GameEntity';
import GameComponent from '../../src/components/GameComponent';

describe('EntityManager', () => {

    it('can be instantiated without error', () => {
        expect(() => new EntityManager()).to.not.throw;
    });

    describe('can extract component groups from entities', () => {
        const item = new EntityManager();

        const entity = new TestEntity(1000);
        const component = new TestComponent(5, 1001, 1000);
        entity.init(component);
        item.entitites.push(entity);

        const system = new TestSystem();
        item.systems.push(system);

        it('without error', () => {
            expect(() => item.getIndexes(system.mask)).to.not.throw;
        });

        it('resulting in correct index shape', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(groupIndex).to.has.ownProperty('entities');
            expect(groupIndex).to.has.ownProperty('components');
            expect(groupIndex).to.has.ownProperty('componentsById');
        });

        it('resulting in correct entity index contents', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(Object.getOwnPropertyNames(groupIndex.entities).length).to.equal(1);
            expect(groupIndex.entities).to.has.ownProperty('testEntities');
            expect(Object.getOwnPropertyNames(groupIndex.entities.testEntities).length).to.equal(1);
            expect(groupIndex.entities.testEntities).to.has.ownProperty('1000');
            expect(Object.getOwnPropertyNames(groupIndex.entities.testEntities['1000']).length).to.equal(1);
            expect(groupIndex.entities.testEntities['1000']).to.has.ownProperty('testComponent');
            expect(groupIndex.entities.testEntities['1000'].testComponent).to.equal(component);
        });

        it('resulting in correct component index contents', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(Object.getOwnPropertyNames(groupIndex.components).length).to.equal(1);
            expect(groupIndex.components).to.has.ownProperty('testComponent');
            expect(groupIndex.components.testComponent.length).to.equal(1);
            expect(groupIndex.components.testComponent[0]).to.equal(component);
        });

        it('resulting in correct component index by ID contents', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(Object.getOwnPropertyNames(groupIndex.componentsById).length).to.equal(1);
            expect(groupIndex.componentsById).to.has.ownProperty('1001');
            expect(groupIndex.componentsById['1001']).to.equal(component);
        });
    });

    describe('produces correct index in general case', () => {
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

        it('without error', () => {
            expect(() => item.getIndexes(system.mask)).to.not.throw;
        });

        it('resulting in correct index shape', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(groupIndex).to.has.ownProperty('entities');
            expect(groupIndex).to.has.ownProperty('components');
            expect(groupIndex).to.has.ownProperty('componentsById');
        });

        it('with correct entity index contents', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(Object.getOwnPropertyNames(groupIndex.entities.testEntities).length).to.equal(4);
            expect(groupIndex.entities.testEntities).to.haveOwnProperty('1000');
            expect(groupIndex.entities.testEntities).to.haveOwnProperty('1001');
            expect(groupIndex.entities.testEntities).to.haveOwnProperty('1002');
            expect(groupIndex.entities.testEntities).to.haveOwnProperty('1003');
        });

        it('with correct component index contents', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(groupIndex.components.testComponent.length).to.equal(4);
        });

        it('with correct component index by ID contents', () => {
            const groupIndex = item.getIndexes(system.mask);
            expect(Object.getOwnPropertyNames(groupIndex.componentsById).length).to.equal(4);
            expect(groupIndex.componentsById['1010']).to.equal(components[0]);
            expect(groupIndex.componentsById['1011']).to.equal(components[1]);
            expect(groupIndex.componentsById['1012']).to.equal(components[2]);
            expect(groupIndex.componentsById['1013']).to.equal(components[4]);
        });

    });

    describe('can update components by using systems', () => {
        let item: EntityManager;
        let component: TestComponent;

        beforeEach(() => {
            item = new EntityManager();

            const entity = new TestEntity(1000);
            component = new TestComponent(5, 1001, 1000);
            entity.init(component);
            item.entitites.push(entity);

            const system = new TestSystem();
            item.systems.push(system);
        });

        it('without error', () => {
            expect(() => item.update()).to.not.throw;
        });

        it('setting correct values', () => {
            item.update();
            expect(component.testValue).to.equal(6);
        });
    });

    describe('can update components in general case', () => {
        let item: EntityManager;
        let components: GameComponent[];

        beforeEach(() => {
            item = new EntityManager();

            const entitites: GameEntity[] = [
                new TestEntity(1000),
                new TestEntity(1001),
                new TestEntity(1002),
                { id: 2000, components: {}, init: () => { } },
                new TestEntity(1003),
            ];
            components = [
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
        });

        it('without error', () => {
            expect(() => item.update()).to.not.throw;
        });

        it('setting correct values', () => {
            item.update();
            expect((components[0] as TestComponent).testValue).to.equal(16);
            expect((components[1] as TestComponent).testValue).to.equal(26);
            expect((components[2] as TestComponent).testValue).to.equal(36);
            expect((components[4] as TestComponent).testValue).to.equal(46);
        });
    });

});
