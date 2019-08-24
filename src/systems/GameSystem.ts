import ComponentMask from "../utilities/ComponentMask";
import { IndexByTypeAndId, ComponentGroup, IndexByType, IndexById } from "../utilities/Collections";
import GameComponent from "../components/GameComponent";

export default interface GameSystem {
    readonly mask: ComponentMask;
    parse(
        entities: IndexByTypeAndId<ComponentGroup>,
        components: IndexByType<GameComponent[]>,
        componentsById?: IndexById<GameComponent>
    ): void;
}


