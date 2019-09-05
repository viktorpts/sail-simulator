import { expect } from 'chai';
import 'mocha';
import { adjustRate, applyRate } from '../../src/systems/Animator';
import AnimationClip from '../../src/components/AnimationClip';
import { STEP_SIZE, TICK_RATE_PER_SEC } from '../../src/constants';

describe('Transform functions', () => {
    let clip: AnimationClip;

    beforeEach(() => {
        clip = {
            id: 1001,
            entityId: 1000,
            state: 0,
            targetState: 1,
            changeRate: 0,
            maxRate: 0.5,
            acceleration: 0.1,
            ended: false
        };
    });

    describe('positive delta required', () => {
        beforeEach(() => {
            clip.state = 0;
            clip.targetState = 1;
            clip.changeRate = 0;
        });

        it('increases rate from static', () => {
            adjustRate(clip);
            expect(clip.changeRate).to.be.greaterThan(0);
        });

        it('increases rate from positive', () => {
            clip.changeRate = 0.1;
            adjustRate(clip);
            expect(clip.changeRate).to.be.greaterThan(0.1);
        });

        it('increases rate from negative', () => {
            clip.changeRate = -1;
            adjustRate(clip);
            expect(clip.changeRate).to.be.greaterThan(-1);
        });

        it('decelerates when approaching target', () => {
            clip.state = 0.95;
            clip.changeRate = 1;

            adjustRate(clip);
            expect(clip.changeRate).to.be.lessThan(1);
        });

        it('does not stop before target', () => {
            const howManySteps = TICK_RATE_PER_SEC;

            clip.state = 0.95;
            clip.changeRate = 0.1;

            for (let i = 0; i < howManySteps; i++) {
                adjustRate(clip);
            }

            expect(clip.changeRate).to.be.greaterThan(0);
        });

        it('does not oscilate', () => {
            const howManySteps = TICK_RATE_PER_SEC;

            clip.state = 0.95;
            clip.changeRate = 1;
            clip.acceleration = 10;
            let prevRate = clip.changeRate;

            for (let i = 0; i < howManySteps; i++) {
                adjustRate(clip);
                expect(clip.changeRate).to.be.lte(prevRate);
                prevRate = clip.changeRate
            }
        });
    });

    describe('negative delta required', () => {
        beforeEach(() => {
            clip.state = 0;
            clip.targetState = -1;
            clip.changeRate = 0;
        });

        it('decreases rate from static', () => {
            adjustRate(clip);
            expect(clip.changeRate).to.be.lessThan(0);
        });

        it('decreases rate from negative', () => {
            clip.changeRate = -0.1;
            adjustRate(clip);
            expect(clip.changeRate).to.be.lessThan(-0.1);
        });

        it('decreases rate from positive', () => {
            clip.changeRate = 1;
            adjustRate(clip);
            expect(clip.changeRate).to.be.lessThan(1);
        });

        it('decelerates when approaching target', () => {
            clip.state = -0.95;
            clip.changeRate = -1;

            adjustRate(clip);
            expect(clip.changeRate).to.be.greaterThan(-1);
        });

        it('does not stop before target', () => {
            const howManySteps = TICK_RATE_PER_SEC;

            clip.state = 0.05;
            clip.changeRate = -0.1;

            for (let i = 0; i < howManySteps; i++) {
                adjustRate(clip);
            }

            expect(clip.changeRate).to.be.lessThan(0);
        });

        it('does not oscilate', () => {
            const howManySteps = TICK_RATE_PER_SEC;

            clip.state = -0.95;
            clip.changeRate = -1;
            clip.acceleration = 10;
            let prevRate = clip.changeRate;

            for (let i = 0; i < howManySteps; i++) {
                adjustRate(clip);
                expect(clip.changeRate).to.be.gte(prevRate);
                prevRate = clip.changeRate
            }
        });
    });

    describe('state morphing', () => {
        beforeEach(() => {
            clip.state = 0;
            clip.targetState = 1;
            clip.changeRate = 0;
        });

        it('applies change over 1 second', () => {
            const howManySteps = TICK_RATE_PER_SEC;

            clip.changeRate = 0.1;

            for (let i = 0; i < howManySteps; i++) {
                applyRate(clip);
            }

            expect(clip.state).to.be.closeTo(0.1, 0.0001);
        });

        it('does not oscilate when approaching target from bellow', () => {
            const howManySteps = TICK_RATE_PER_SEC;

            clip.state = 0.9;
            clip.changeRate = 0.2;

            for (let i = 0; i < howManySteps; i++) {
                applyRate(clip);
            }

            expect(clip.state).to.be.closeTo(1, 0.0001);
        });

        it('does not oscilate when approaching target from above', () => {
            const howManySteps = TICK_RATE_PER_SEC;

            clip.state = 0.1;
            clip.targetState = 0;
            clip.changeRate = -0.2;

            for (let i = 0; i < howManySteps; i++) {
                applyRate(clip);
            }

            expect(clip.state).to.be.closeTo(0, 0.0001);
        });
    });

});