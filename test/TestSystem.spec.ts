import { expect } from 'chai';
import 'mocha';
import TestSystem from '../src/systems/TestSystem';
import TestComponent from '../src/components/TestComponent';
import TestEntity from '../src/entities/TestEntity';
import { ComponentArray, ComponentIndexByType, ComponentIndex, IndexByTypeAndId, ComponentGroup, IndexByType, IndexById } from '../src/utilities/Collections';
import GameComponent from '../src/components/GameComponent';

describe('System', () => {

    it('can be instantiated without error', () => {
        expect(() => new TestSystem()).to.not.throw;
    });

    it('has correct mask', () => {
        const item = new TestSystem();
        expect(item.mask.testEntities.testComponent.type).to.equal(TestComponent);
        expect(item.mask.testEntities.testComponent.required).to.be.true;
    });

    it('can interact with entitites', () => {
        const item = new TestSystem();

        const entityId = 1;
        const compId = 2;
        const entity = new TestEntity(entityId);
        const component = new TestComponent(6, compId, entityId);
        entity.init(component);

        const entities = { testEntities: { [entityId]: { testComponent: component } } };
        const components = { testComponents: [component] };
        const index: IndexById<GameComponent> = { 2: component };

        item.parse(entities,
            components,
            index);

        expect(component.testValue).to.equal(7);
    });


    it('can distinguish component', () => {
        const item = new TestSystem();

        const entityId = 1;
        const compId = 2;
        const entity = new TestEntity(entityId);
        const component = new TestComponent(6, compId, entityId);
        const decoy = new TestComponent(9, 3, entityId);
        entity.init(component);

        const entities = { testEntities: { [entityId]: { testComponent: component, decoyComponent: decoy } } };
        const components = { testComponents: [component], decoyComponents: [decoy] };
        const index: IndexById<GameComponent> = { 2: component, 3: decoy };

        item.parse(entities,
            components,
            index);

        expect(component.testValue).to.equal(7);
        expect(decoy.testValue).to.equal(9);
    });

    it('can distinguish entities', () => {
        const item = new TestSystem();

        const entityId = 1;
        const compId = 2;
        const entity = new TestEntity(entityId);
        const component = new TestComponent(6, compId, entityId);
        const decoy = new TestComponent(9, 3, 4);
        entity.init(component);

        const entities = {
            testEntities: {
                [entityId]: { testComponent: component }
            },
            decoyEntities: {
                4: { decoyComponent: decoy }
            }
        };
        const components = { testComponents: [component], decoyComponents: [decoy] };
        const index: IndexById<GameComponent> = { 2: component, 3: decoy };

        item.parse(entities,
            components,
            index);

        expect(component.testValue).to.equal(7);
        expect(decoy.testValue).to.equal(9);
    });
});