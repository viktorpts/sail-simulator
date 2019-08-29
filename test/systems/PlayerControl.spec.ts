import { expect } from 'chai';
import 'mocha';
import PlayerControl from '../../src/systems/PlayerControl';
import InputState from '../../src/components/InputState';
import BoatControlState from '../../src/components/BoatControlState';
import { Input } from '../../src/ctrlScheme';
import { EntityIndexById } from '../../src/utilities/Collections';

describe('PlayerControl System', () => {

    it('can be instantiated without error', () => {
        expect(() => new PlayerControl()).to.not.throw;
    });

    it('can interact with entitites', () => {
        const item = new PlayerControl();

        const input = new InputState(1001, 1000);
        const control = new BoatControlState(1002, 1000);
        input[Input.MoreSails] = true;

        item.parse({
            actors: new EntityIndexById({
                1000: {
                    input,
                    control
                }
            })
        });
        
        expect(control.accelerating).to.be.true;
    });

});