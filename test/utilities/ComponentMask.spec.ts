import { expect } from 'chai';
import 'mocha';
import ComponentMask, { applyMask } from '../../src/utilities/ComponentMask';
import { IndexByType, ComponentGroup } from '../../src/utilities/Collections';
import GameComponent from '../../src/components/GameComponent';
import TestComponent from '../../src/components/TestComponent';

describe('Masking utility', () => {

    describe('can parse single match', () => {
        const component = new TestComponent(1,2,3);
        const components: IndexByType<GameComponent> = {
            [TestComponent.name]: component
        };
        const mask: ComponentMask = {
            testEntitites: {
                testComponent: {
                    type: TestComponent,
                    required: true
                }
            }
        };
        let masked: IndexByType<ComponentGroup>;

        beforeEach(() => {
            masked = applyMask(components, mask);
        });

        it('with correct entity type', () => {
            expect(masked).has.ownProperty('testEntitites');
        });
        it('with correct component type', () => {
            expect(masked.testEntitites).to.has.ownProperty('testComponent');
        });
        it('with correct component reference', () => {
            expect(masked.testEntitites.testComponent).to.equal(component);
        });
    });

    describe('can reject single mismatch', () => {
        const component = new TestComponent(1,2,3);
        const components: IndexByType<GameComponent> = {
            MismatchingType: component
        };
        const mask: ComponentMask = {
            testEntitites: {
                testComponent: {
                    type: TestComponent,
                    required: true
                }
            }
        };
        let masked: IndexByType<ComponentGroup>;

        beforeEach(() => {
            masked = applyMask(components, mask);
        });

        it('with correct entity type', () => {
            expect(masked).to.has.ownProperty('testEntitites');
        });
        it('setting reference to null', () => {
            expect(masked.testEntitites).to.equal(null);
        });
    });

    describe('can parse compound group', () => {
        const component = new TestComponent(1,2,3);
        const components: IndexByType<GameComponent> = {
            MismatchingType: {id: 4, entityId: 5},
            [TestComponent.name]: component
        };
        const mask: ComponentMask = {
            testEntitites: {
                testComponent: {
                    type: TestComponent,
                    required: true
                }
            }
        };
        let masked: IndexByType<ComponentGroup>;

        beforeEach(() => {
            masked = applyMask(components, mask);
        });

        it('with correct entity type', () => {
            expect(masked).to.has.ownProperty('testEntitites');
        });
        it('with correct component type', () => {
            expect(masked.testEntitites).to.has.ownProperty('testComponent');
        });
        it('omitting unlisted component types', () => {
            expect(Object.getOwnPropertyNames(masked).length).to.equal(1);
            expect(Object.getOwnPropertyNames(masked.testEntitites).length).to.equal(1);
        });
        it('with correct component reference', () => {
            expect(masked.testEntitites.testComponent).to.equal(component);
        });
    });

    describe('can parse complex match', () => {
        const componentArray = [
            new TestComponent(1,2,3),
            new TestComponent(4,5,6),
            new TestComponent(7,8,9),
            new TestComponent(10,11,12),
        ];
        const components: IndexByType<GameComponent> = {
            Type1: componentArray[0],
            Type2: componentArray[1],
            Type3: componentArray[2],
            Type4: componentArray[3],
        };
        const mask: ComponentMask = {
            testEntitites: {
                Type2: {
                    type: class Type2 extends GameComponent {},
                    required: true
                },
                Type4: {
                    type: class Type4 extends GameComponent {},
                    required: true
                },
                Type5: {
                    type: class Type5 extends GameComponent {},
                    required: false
                }
            }
        };
        let masked: IndexByType<ComponentGroup>;

        beforeEach(() => {
            masked = applyMask(components, mask);
        });

        it('with correct entity type', () => {
            expect(masked).has.ownProperty('testEntitites');
        });
        it('with correct component type', () => {
            expect(masked.testEntitites).has.ownProperty('Type2');
            expect(masked.testEntitites).has.ownProperty('Type4');
        });
        it('omitting unlisted component types', () => {
            expect(Object.getOwnPropertyNames(masked).length).to.equal(1);
            expect(Object.getOwnPropertyNames(masked.testEntitites).length).to.equal(3);
        });
        it('setting optional components to null', () => {
            expect(masked.testEntitites.Type5).to.equal(null);
        });
        it('with correct component reference', () => {
            expect(masked.testEntitites.Type2).to.equal(componentArray[1]);
            expect(masked.testEntitites.Type4).to.equal(componentArray[3]);
        });
    });

});