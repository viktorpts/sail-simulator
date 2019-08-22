export default class IdGenerator {
    private currentId: number;

    constructor(id = 1000) {
        this.currentId = id;
        
        this.nextId = this.nextId.bind(this);
    }

    nextId() {
        return ++(this.currentId);
    }
}