import { expect } from 'chai';
import 'mocha';
import Physics from '../../src/systems/Physics';
import { createBoatDriver, createTerrain } from '../../src/utilities/factories/entityFactory';
import Identity from '../../src/utilities/Identity';
import { EntityIndexById } from '../../src/utilities/Collections';
import Position from '../../src/components/Position';
import BoatLocomotion from '../../src/components/BoatLocomotion';
import { parse } from 'ts-node';
import { STEP_RATE } from '../../src/constants';

describe('Physics System', () => {
    const identity = new Identity();
    const terrain = new EntityIndexById({
        1000: {
            collider: createTerrain(identity, 1000)
        }
    });

    it('can be instantiated without error', () => {
        expect(() => new Physics()).to.not.throw;
    });

    it('can interact with entitites', () => {
        const item = new Physics();

        const driver = createBoatDriver(identity, 1001);
        const position = new Position(identity.next(), 1001);
        const bodies = new EntityIndexById({
            1001: {
                driver,
                position
            }
        });

        item.parse({ bodies, terrain });

        expect(position.x).to.equal(0);
        expect(position.y).to.equal(0);
        expect(position.z).to.equal(0);
    });

    describe('Translation', () => {
        let item: Physics;
        let driver: BoatLocomotion;
        let position: Position;
        let bodies: EntityIndexById<{ driver: BoatLocomotion, position: Position }>;

        beforeEach(() => {
            item = new Physics();
            driver = createBoatDriver(identity, 1001);
            position = new Position(identity.next(), 1001);
            bodies = new EntityIndexById({
                1001: {
                    driver,
                    position
                }
            });
        });

        it('can move north', () => {
            const howManySteps = 10;

            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
            }

            expect(position.y).to.be.greaterThan(0);
        });

        it('can move east', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 0.5;
            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
            }

            expect(position.x).to.be.greaterThan(0);
        });

        it('can move south', () => {
            const howManySteps = 10;

            position.heading = Math.PI;
            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
            }

            expect(position.y).to.be.lessThan(0);
        });

        it('can move west', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 1.5;
            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
            }

            expect(position.x).to.be.lessThan(0);
        });

        it('decelerates while moving', () => {
            const howManySteps = 10;

            driver.forces.forward = driver.limits.forward;

            let prevSpeed = driver.forces.forward;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
                expect(driver.forces.forward).to.be.lessThan(prevSpeed);
                prevSpeed = driver.forces.forward;
            }
        });

    });

    describe('Rotation', () => {
        let item: Physics;
        let driver: BoatLocomotion;
        let position: Position;
        let bodies: EntityIndexById<{ driver: BoatLocomotion, position: Position }>;

        beforeEach(() => {
            item = new Physics();
            driver = createBoatDriver(identity, 1001);
            position = new Position(identity.next(), 1001);
            bodies = new EntityIndexById({
                1001: {
                    driver,
                    position
                }
            });
        });

        it('can turn clockwise (increasing heading)', () => {
            const howManySteps = 10;

            driver.forces.heading = driver.limits.heading;

            let prevHeading = position.heading;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
                expect(position.heading).to.be.greaterThan(prevHeading);
                prevHeading = position.heading;
            }
        });

        it('can turn counterclockwise (decreasing heading)', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 2 - driver.limits.heading * STEP_RATE; // Decrease past 0 initially to prevent clamping errors
            driver.forces.heading = -driver.limits.heading;

            let prevHeading = position.heading;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
                expect(position.heading).to.be.lessThan(prevHeading);
                prevHeading = position.heading;
            }
        });

        it('clamps heading while turning clockwise', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 2 - driver.limits.heading * STEP_RATE;
            driver.forces.heading = driver.limits.heading;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
            }

            expect(position.heading).to.be.closeTo(driver.limits.heading * STEP_RATE * (howManySteps - 1), 4);
        });

        it('clamps heading while turning counterclockwise', () => {
            const howManySteps = 10;

            position.heading = driver.limits.heading * STEP_RATE;
            driver.forces.heading = -driver.limits.heading;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain });
            }

            expect(position.heading).to.be.closeTo(Math.PI * 2 - driver.limits.heading * STEP_RATE * (howManySteps - 1), 4);
        });

    });

});