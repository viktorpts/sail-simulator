import { expect } from 'chai';
import 'mocha';
import EntityManager from '../../src/utilities/EntityManager';
import { createPlayerBoat } from '../../src/utilities/factories/entityFactory';
import Identity from '../../src/utilities/Identity';
import InputState from '../../src/components/InputState';
import PlayerControl from '../../src/systems/PlayerControl';
import { TICK_RATE_PER_SEC } from '../../src/constants';
import { Input } from '../../src/ctrlScheme';
import BoatControlState from '../../src/components/BoatControlState';

describe('EntityManager Input processing', () => {
    const identity = new Identity();
    let item = new EntityManager();
    let input = new InputState(identity.next(), 1000);
    let boat = createPlayerBoat(identity, input);
    let playerControl = new PlayerControl();

    item.entitites.push(boat);
    item.systems.push(playerControl);

    beforeEach(() => {
        item = new EntityManager();
        input = new InputState(identity.next(), 1000);
        boat = createPlayerBoat(identity, input);
        playerControl = new PlayerControl();
        item.entitites.push(boat);
        item.systems.push(playerControl);
    });

    it('updates without error', () => {
        expect(() => item.update()).to.not.throw;
    });

    it('simulates one second without error', () => {
        const howManySteps = TICK_RATE_PER_SEC;

        for (let i = 0; i < howManySteps; i++) {
            expect(() => item.update()).to.not.throw;
        }
    });

    it('applies plyer input to control state', () => {
        input[Input.MoreSails] = true;
        item.update();
        expect((boat.components[BoatControlState.name] as BoatControlState).accelerating).to.be.true;
    });

    it('simulates one second of input', () => {
        const howManySteps = TICK_RATE_PER_SEC;
        input[Input.MoreSails] = true;

        for (let i = 0; i < howManySteps; i++) {
            item.update();
            expect((boat.components[BoatControlState.name] as BoatControlState).accelerating).to.be.true;
        }
    });

});
