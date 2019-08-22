import GameComponent from "../components/GameComponent";

export default interface ComponentBlock {
    // TODO: implement TypedArray wrapper with the following functionality
    // Iterate over elements (Symbol.Iterator)
    // Iterate with applied filter of entity IDs
    // Access individual element by index/ID
    // Component collections as properties
    
    [index: string]: GameComponent[]
}