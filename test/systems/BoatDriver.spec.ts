import { expect } from 'chai';
import 'mocha';
import BoatDriver from '../../src/systems/BoatDriver';
import BoatControlState from '../../src/components/BoatControlState';
import { createBoatDriver } from '../../src/utilities/factories/entityFactory';
import Identity from '../../src/utilities/Identity';
import { EntityIndexById } from '../../src/utilities/Collections';

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

});
