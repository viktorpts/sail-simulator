import ComponentBlock from "../utilities/ComponentBlock";

export default interface GameSystem {
    (components: ComponentBlock): void;
}