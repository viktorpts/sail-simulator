import ComponentMask from "../utilities/ComponentMask";
import { IndexByTypeAndId, ComponentGroup, IndexByType, IndexById } from "../utilities/Collections";
import GameComponent from "../components/GameComponent";

export default interface GameSystem {
    // TODO: the mask never changes, it can be shared between systems, making memoization easier (just a reference comparison to the mask)
    readonly mask: ComponentMask;
    parse(
        entities: IndexByTypeAndId<ComponentGroup>,
        components: IndexByType<GameComponent[]>,
        componentsById?: IndexById<GameComponent>
    ): void;
}


