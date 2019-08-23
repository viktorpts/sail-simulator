import ComponentMask from "../utilities/ComponentMask";
import { ComponentBlock, ComponentGroup } from "../utilities/ComponentCollections";

export default interface GameSystem {
    parse (components: ComponentBlock[], groups: ComponentGroup[]): void;
    mask: ComponentMask;
}