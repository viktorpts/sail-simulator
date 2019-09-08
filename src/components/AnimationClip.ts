import GameComponent from "./GameComponent";

export default class AnimationClip extends GameComponent {
    state: number;
    targetState: number;
    changeRate = 0;
    maxRate = 0;
    acceleration: number;
    ended = false;
}