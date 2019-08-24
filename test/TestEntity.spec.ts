import { expect } from 'chai';
import 'mocha';
import TestEntity from '../src/entities/TestEntity';
import TestComponent from '../src/components/TestComponent';

describe('Entity', () => {

    it('can be instantiated without error', () => {
        expect(() => new TestEntity(1)).to.not.throw;
    });

    it('has correct initial property values', () => {
        const item = new TestEntity(1);
        expect(item.id).to.equal(1);
    });

    it('can be initialized with components', () => {
        const itemId = 1
        const item = new TestEntity(itemId);
        expect(() => item.init(new TestComponent(5, 2, itemId))).to.not.throw;
    });

    it('keeps correct component refs', () => {
        const itemId = 1
        const item = new TestEntity(itemId);
        const component = new TestComponent(5, 2, itemId);
        item.init(component);
        expect(item.components[TestComponent.name]).to.equal(component);
    });

});