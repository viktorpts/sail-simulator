import GameComponent from "./GameComponent";
import { Input } from '../ctrlScheme';

export default class InputState extends GameComponent {
    [Input.Up] = false;
    [Input.Down] = false;
    [Input.Left] = false;
    [Input.Right] = false;
    [Input.MoreSails] = false;
    [Input.LessSails] = false;
    [Input.TurnLeft] = false;
    [Input.TurnRight] = false;
    [Input.TrimLeft] = false;
    [Input.TrimRight] = false;

    constructor(id: number, entityId: number) {
        super(id, entityId);
    }
}