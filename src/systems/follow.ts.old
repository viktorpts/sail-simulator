import GameSystem from "./GameSystem";
import Follower from "../components/Follower";
import Position from "../components/Position";

export const parse: GameSystem = function (components: { follower: Follower[], position: Position[] }) {
    for (let i = 0; i < components.follower.length; i++) {
        const follower = components.follower[i];
        const position = components.position[i];

        position.x = follower.target.x;
        position.z = follower.target.z;
        if (follower.matchElevation) {
            position.y = follower.target.y;
        }
        if (follower.matchDirection) {
            position.rotY = follower.target.rotY;
        }
    }
}