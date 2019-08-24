import { expect } from 'chai';
import 'mocha';
import TestComponent from '../src/components/TestComponent';

describe('Component', () => {

    it('can be instantiated without error', () => {
        expect(() => new TestComponent(5, 1, 2)).to.not.throw;
    });

    it('has correct initial property values', () => {
        const item = new TestComponent(5, 1, 2);
        expect(item.testValue).to.equal(5);
        expect(item.id).to.equal(1);
        expect(item.entityId).to.equal(2);
    });

});