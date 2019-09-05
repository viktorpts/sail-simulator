import { expect } from 'chai';
import 'mocha';
import Physics from '../../src/systems/Physics';
import EntityFactory from '../../src/utilities/factories/EntityFactory';
import Identity from '../../src/utilities/Identity';
import { EntityIndexById } from '../../src/utilities/Collections';
import Position from '../../src/components/Position';
import BoatLocomotion from '../../src/components/BoatLocomotion';
import { STEP_SIZE } from '../../src/constants';
import Wind from '../../src/components/Wind';

describe('Physics System', () => {
    const identity = new Identity();
    const factory = new EntityFactory(identity);

    const terrain = new EntityIndexById({
        1000: {
            collider: factory.createTerrainCollider(1000)
        }
    });

    it('can be instantiated without error', () => {
        expect(() => new Physics()).to.not.throw;
    });

    it('can interact with entitites', () => {
        const item = new Physics();

        const driver = factory.createBoatDriver(1001);
        const position = new Position(identity.next(), 1001);
        const bodies = new EntityIndexById({
            1001: {
                driver,
                position
            }
        });
        const environment = new EntityIndexById({
            1000: {
                wind: factory.createWind(1000)
            }
        });

        item.parse({ bodies, terrain, environment });

        expect(position.x).to.equal(0);
        expect(position.y).to.equal(0);
        expect(position.z).to.equal(0);
    });

    describe('Translation', () => {
        let item: Physics;
        let driver: BoatLocomotion;
        let position: Position;
        let bodies: EntityIndexById<{ driver: BoatLocomotion, position: Position }>;
        let wind: Wind;
        let environment: EntityIndexById<{ wind: Wind }>;

        beforeEach(() => {
            item = new Physics();
            driver = factory.createBoatDriver(1001);
            position = new Position(identity.next(), 1001);
            bodies = new EntityIndexById({
                1001: {
                    driver,
                    position
                }
            });
            wind = factory.createWind(1000);
            environment = new EntityIndexById({
                1000: {
                    wind
                }
            });
        });

        it('can move north', () => {
            const howManySteps = 10;

            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
            }

            expect(position.y).to.be.greaterThan(0);
        });

        it('can move east', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 0.5;
            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
            }

            expect(position.x).to.be.greaterThan(0);
        });

        it('can move south', () => {
            const howManySteps = 10;

            position.heading = Math.PI;
            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
            }

            expect(position.y).to.be.lessThan(0);
        });

        it('can move west', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 1.5;
            driver.forces.forward = driver.limits.forward;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
            }

            expect(position.x).to.be.lessThan(0);
        });

        it('decelerates while moving', () => {
            const howManySteps = 10;

            driver.forces.forward = driver.limits.forward;

            let prevSpeed = driver.forces.forward;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
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
        let wind: Wind;
        let environment: EntityIndexById<{ wind: Wind }>;

        beforeEach(() => {
            item = new Physics();
            driver = factory.createBoatDriver(1001);
            position = new Position(identity.next(), 1001);
            bodies = new EntityIndexById({
                1001: {
                    driver,
                    position
                }
            });
            wind = factory.createWind(1000);
            environment = new EntityIndexById({
                1000: {
                    wind
                }
            });
        });

        // Does not apply to most cases
        /*
        it('does not turn while stationary', () => {
            const howManySteps = 10;

            driver.forces.heading = driver.limits.heading;

            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
                expect(position.heading).to.equal(0);
            }
        });
        */

        it('can turn clockwise (increasing heading)', () => {
            const howManySteps = 10;

            driver.forces.heading = driver.limits.heading;
            driver.forces.forward = driver.limits.forward; // Turning wont work unless the boat is moving

            let prevHeading = position.heading;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
                expect(position.heading).to.be.greaterThan(prevHeading);
                prevHeading = position.heading;
            }
        });

        it('can turn counterclockwise (decreasing heading)', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 2 - driver.limits.heading * STEP_SIZE; // Decrease past 0 initially to prevent clamping errors
            driver.forces.heading = -driver.limits.heading;
            driver.forces.forward = driver.limits.forward; // Turning wont work unless the boat is moving

            let prevHeading = position.heading;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ bodies, terrain, environment });
                expect(position.heading).to.be.lessThan(prevHeading);
                prevHeading = position.heading;
            }
        });

        it('clamps heading while turning clockwise', () => {
            const howManySteps = 10;

            position.heading = Math.PI * 2 - driver.limits.heading * STEP_SIZE;
            driver.forces.heading = driver.limits.heading;

            for (let i = 0; i < howManySteps; i++) {
                driver.forces.forward = driver.limits.forward; // Physics will slow down the boat every tick
                item.parse({ bodies, terrain, environment });
            }

            expect(position.heading).to.be.closeTo(driver.limits.heading * STEP_SIZE * (howManySteps - 1), 0.0001);
        });

        it('clamps heading while turning counterclockwise', () => {
            const howManySteps = 10;

            position.heading = driver.limits.heading * STEP_SIZE;
            driver.forces.heading = -driver.limits.heading;

            for (let i = 0; i < howManySteps; i++) {
                driver.forces.forward = driver.limits.forward; // Physics will slow down the boat every tick
                item.parse({ bodies, terrain, environment });
            }

            expect(position.heading).to.be.closeTo(Math.PI * 2 - driver.limits.heading * STEP_SIZE * (howManySteps - 1), 0.0001);
        });

    });

});