import GameSystem from "./GameSystem";
import ComponentMask from "../utilities/ComponentMask";
import { EntityIndexById } from "../utilities/Collections";
import BoatLocomotion from "../components/BoatLocomotion";
import AnimationRigging from "../components/AnimationRigging";

export default class SailAnimator implements GameSystem {
    readonly mask: ComponentMask = {
        actors: {
            driver: {
                type: BoatLocomotion,
                required: true
            },
            rigging: {
                type: AnimationRigging,
                required: true
            }
        }
    }

    parse(entities: {
        actors: EntityIndexById<{ driver: BoatLocomotion, rigging: AnimationRigging }>
    }) {
        for (let actor of entities.actors) {
            actor.rigging.clips.heel.targetState = calcHeel(actor.driver);
            actor.rigging.clips.boom.targetState = calcBoom(actor.driver);
            actor.rigging.clips.headsail.targetState = calcHeadsail(actor.driver);
        }
    }
}

function calcHeel(driver: BoatLocomotion) {
    const speedFraction = driver.sailForce.x / 5;
    const leaning = (Math.PI / 3 - Math.abs(driver.trimAngle)) * 0.4 * speedFraction;
    return leaning;
}

function calcBoom(driver: BoatLocomotion) {
    return driver.trimAngle;
}

function calcHeadsail(driver: BoatLocomotion) {
    if (Math.abs(driver.trimAngle) > driver.maxTrimAngle * 0.8) {
        return -driver.trimAngle * 1.3;
    } else {
        return driver.trimAngle * 1.3;
    }
}