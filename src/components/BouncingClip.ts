import AnimationClip from "./AnimationClip";

export default class BouncingClip extends AnimationClip {
    lowerState: number;
    upperState: number;
    currentDirectionForward = true;
}