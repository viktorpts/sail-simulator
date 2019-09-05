import GameComponent from "./GameComponent";
import AnimationClip from "./AnimationClip";

export default abstract class AnimationRigging extends GameComponent {
    clips: { [index: string]: AnimationClip };
}