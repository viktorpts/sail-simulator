import GameEntity from "./GameEntity";
import Wind from '../components/Wind';

export default class Environment extends GameEntity {
    init(wind: Wind) {
        this.components[Wind.name] = wind;
    }
}