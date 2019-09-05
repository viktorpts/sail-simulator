import AnimationClip from "./AnimationClip";

export default class LoopingClip extends AnimationClip {
    lowerState: number;
    upperState: number;
    drectionForward = true;
}