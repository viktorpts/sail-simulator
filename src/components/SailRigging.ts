import AnimationRigging from "./AnimationRigging";
import AnimationClip from "./AnimationClip";

export default class SailRigging extends AnimationRigging {
    clips: {
        heel: AnimationClip,
        boom: AnimationClip,
        headsail: AnimationClip
    };
}