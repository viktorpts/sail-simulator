import { expect } from 'chai';
import 'mocha';
import BoatDriver from '../../src/systems/BoatDriver';
import BoatControlState from '../../src/components/BoatControlState';
import { createBoatDriver } from '../../src/utilities/factories/entityFactory';
import Identity from '../../src/utilities/Identity';
import { EntityIndexById } from '../../src/utilities/Collections';
import BoatLocomotion from '../../src/components/BoatLocomotion';
import { STEP_RATE } from '../../src/constants';

describe('BoatDriver System', () => {
    const identity = new Identity();

    it('can be instantiated without error', () => {
        expect(() => new BoatDriver()).to.not.throw;
    });

    it('can interact with entitites', () => {
        const item = new BoatDriver();

        const control = new BoatControlState(1002, 1001);
        control.accelerating = true;
        const driver = createBoatDriver(identity, 1001);

        item.parse({
            boats: new EntityIndexById({
                1001: {
                    control,
                    driver
                }
            })
        });

        expect(driver.forces.forward).to.be.greaterThan(0);
    });

    describe('Control ranges', () => {
        let item: BoatDriver;
        let control: BoatControlState;
        let driver: BoatLocomotion;
        let boats: EntityIndexById<{ control: BoatControlState, driver: BoatLocomotion }>;

        beforeEach(() => {
            item = new BoatDriver();
            control = new BoatControlState(identity.next(), 1001);
            driver = createBoatDriver(identity, 1001);
            boats = new EntityIndexById({
                1001: {
                    control,
                    driver
                }
            });
        })

        it('does nothing when controls are off', () => {
            item.parse({ boats });
            expect(driver.forces.x).to.equal(0);
            expect(driver.forces.y).to.equal(0);
            expect(driver.forces.z).to.equal(0);
            expect(driver.forces.rotX).to.equal(0);
            expect(driver.forces.rotY).to.equal(0);
            expect(driver.forces.rotZ).to.equal(0);
        });

        it('can\'t decelerate past 0', () => {
            control.decelerating = true;
            item.parse({ boats });
            expect(driver.forces.forward).to.equal(0);
        });

        it('accelerates at correct rate', () => {
            const howManySteps = 10;

            control.accelerating = true;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ boats });
            }
            expect(driver.forces.forward).to.be.closeTo(driver.rates.forward * howManySteps * STEP_RATE, 4);
        });

        it('can\'t accelerate past limit', () => {
            const howManySteps = Math.ceil((driver.limits.forward / driver.rates.forward) * (1 / STEP_RATE));

            control.accelerating = true;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ boats });
            }
            expect(driver.forces.forward).to.equal(driver.limits.forward);
            // Accelerate for one more frame
            item.parse({ boats });
            expect(driver.forces.forward).to.equal(driver.limits.forward);
        });

        it('can turn left', () => {
            const howManySteps = 10;

            control.turningLeft = true;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ boats });
            }
            expect(driver.forces.heading).to.be.closeTo(-driver.rates.heading * howManySteps * STEP_RATE, 4);
        });

        it('can turn right', () => {
            const howManySteps = 10;

            control.turningRight = true;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ boats });
            }
            expect(driver.forces.heading).to.be.closeTo(driver.rates.heading * howManySteps * STEP_RATE, 4);
        });

        it('can trim portside', () => {
            const howManySteps = 10;

            control.trimmingLeft = true;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ boats });
            }
            expect(driver.trimAngle).to.be.closeTo(driver.trimRate * howManySteps * STEP_RATE, 4);
        });

        it('can trim starboard', () => {
            const howManySteps = 10;

            control.trimmingRight = true;
            for (let i = 0; i < howManySteps; i++) {
                item.parse({ boats });
            }
            expect(driver.trimAngle).to.be.closeTo(-driver.trimRate * howManySteps * STEP_RATE, 4);
        });
    });

});
