import GameSystem from "./GameSystem";
import ComponentMask from "../utilities/ComponentMask";
import AnimationRigging from "../components/AnimationRigging";
import AnimationClip from "../components/AnimationClip";
import LoopingClip from "../components/LoopingClip";
import BouncingClip from "../components/BouncingClip";
import WrappingClip from "../components/WrappingClip";
import { EntityIndexById } from "../utilities/Collections";
import { STEP_SIZE } from "../constants";
import { wrap } from "../utilities/helpers";

//import * as fs from 'fs';


export default class Animator implements GameSystem {
    readonly mask: ComponentMask = {
        actors: {
            rigging: {
                type: AnimationRigging,
                required: true
            }
        }
    }

    parse(
        entities: {
            actors: EntityIndexById<{ rigging: AnimationRigging }>
        }
    ) {
        for (let actor of entities.actors) {
            for (let clipName of Object.getOwnPropertyNames(actor.rigging.clips)) {
                const clip = actor.rigging.clips[clipName];
                if (clip.ended) {
                    if (onAnimationEnd(clip)) {
                        continue;
                    }
                }
                if (clip.state !== clip.targetState) {
                    adjustRate(clip);
                    applyRate(clip);

                    if (clip.state === clip.targetState) {
                        clip.ended = true;
                    }
                }
            }
        }
    }
}

export function adjustRate(clip: AnimationClip) {
    if (clip.acceleration === null) {
        return;
    }

    let requiredDelta = clip.targetState - clip.state;

    if (clip instanceof WrappingClip) {
        const forwardDelta = clip.targetState - (clip.state - (clip.upperState - clip.lowerState));
        const reverseDelta = clip.targetState - (clip.state + (clip.upperState - clip.lowerState));
        const adjusted = Math.abs(forwardDelta) <= Math.abs(reverseDelta) ? forwardDelta : reverseDelta;
        if (Math.abs(adjusted) < Math.abs(requiredDelta)) {
            requiredDelta = adjusted;
        }
    }

    const distanceToStop = (clip.changeRate ** 2) / (2 * clip.acceleration) * Math.sign(clip.changeRate);

    if (Math.sign(distanceToStop) == Math.sign(requiredDelta) && Math.abs(distanceToStop) >= Math.abs(requiredDelta)) {
        if (requiredDelta > 0) {
            clip.changeRate = Math.max(clip.changeRate - clip.acceleration * STEP_SIZE, 0);
        } else {
            clip.changeRate = Math.min(clip.changeRate + clip.acceleration * STEP_SIZE, 0);
        }
    } else {
        if (clip.changeRate * STEP_SIZE > requiredDelta) {
            clip.changeRate = clip.changeRate - clip.acceleration * STEP_SIZE;
        } else {
            clip.changeRate = clip.changeRate + clip.acceleration * STEP_SIZE;
        }
        if (clip.maxRate !== 0 && Math.abs(clip.changeRate) > clip.maxRate) {
            clip.changeRate = Math.sign(clip.changeRate) * clip.maxRate;
        }
    }
}

export function applyRate(clip: AnimationClip) {
    if (clip instanceof WrappingClip) {
        const prevShortest = getShortestDistance(clip.state, clip.targetState, clip.lowerState, clip.upperState);
        clip.state = wrap(clip.state + clip.changeRate * STEP_SIZE, clip.lowerState, clip.upperState);
        const newShortest = getShortestDistance(clip.state, clip.targetState, clip.lowerState, clip.upperState);
        if (Math.sign(prevShortest) !== Math.sign(newShortest)) {
            clip.state = clip.targetState
        }
    } else {
        if (clip.changeRate > 0) {
            clip.state = Math.min(clip.state + clip.changeRate * STEP_SIZE, clip.targetState);
        } else if (clip.changeRate < 0) {
            clip.state = Math.max(clip.state + clip.changeRate * STEP_SIZE, clip.targetState);
        }
    }
}

function getShortestDistance(current: number, target: number, min: number, max: number) {
    let requiredDelta = target - current;
    const forwardDelta = target - (current - (max - min));
    const reverseDelta = target - (current + (max - min));
    const adjusted = Math.abs(forwardDelta) <= Math.abs(reverseDelta) ? forwardDelta : reverseDelta;
    if (Math.abs(adjusted) < Math.abs(requiredDelta)) {
        requiredDelta = adjusted;
    }

    return requiredDelta;
}

function onAnimationEnd(clip: AnimationClip): boolean {
    let skipProcessingThisFrame = false;
    if (clip instanceof LoopingClip) {
        clip.state = clip.drectionForward ? clip.lowerState : clip.upperState;
        skipProcessingThisFrame = true;
    } else if (clip instanceof BouncingClip) {
        if (clip.currentDirectionForward) {
            clip.currentDirectionForward = false;
            clip.targetState = clip.lowerState;
        } else {
            clip.currentDirectionForward = true;
            clip.targetState = clip.upperState;
        }
    } else if (clip instanceof WrappingClip) {
        clip.changeRate = 0;
    } else {
        clip.changeRate = 0;
    }
    clip.ended = false;

    return skipProcessingThisFrame;
}

/*
function exportGraph() {
    const animator = new Animator();

    /*
    const clip = {
        id: 1001,
        entityId: 1000,
        state: 0,
        targetState: 1,
        changeRate: 0,
        maxRate: 1,
        acceleration: 10,
    } as AnimationClip;

    /*
    const clip = new LoopingClip(1002, 1001);
    clip.state = 0;
    clip.targetState = 1;
    clip.changeRate = 1;
    clip.maxRate = 1;
    clip.acceleration = null;
    clip.lowerState = 0;
    clip.upperState = 1;

    /*
    const clip = new BouncingClip(1002, 1001);
    clip.state = 0;
    clip.targetState = 1;
    clip.changeRate = 0;
    clip.maxRate = 1;
    clip.acceleration = 1;
    clip.lowerState = 0;
    clip.upperState = 1;

    const clip = new WrappingClip(1002, 1001);
    clip.state = 15;
    clip.targetState = 330;
    clip.changeRate = 0;
    clip.maxRate = 30;
    clip.acceleration = 60;
    clip.lowerState = 0;
    clip.upperState = 360;

    const actors = new EntityIndexById({
        1001: {
            rigging:
            {
                id: 1002,
                entityId: 1003,
                clips: { clip }
            }
        }
    });

    const frames = 500;
    let time = 0;
    let output = `${time}\t${clip.state}\t${clip.changeRate}\n`;

    for (let i = 0; i < frames; i++) {
        time += STEP_SIZE;
        animator.parse({ actors });
        output += `${time}\t${clip.state}\t${clip.changeRate}\n`;
    }

    fs.writeFileSync('./rate.txt', output);
}

exportGraph();
*/

//console.log(getShortestDistance(16, 15, 0, 360));
//console.log(getShortestDistance(14, 15, 0, 360));
