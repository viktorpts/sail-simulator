export default class Identity {
    private currentId: number;

    constructor(id = 1000) {
        this.currentId = id;
        
        this.next = this.next.bind(this);
    }

    next() {
        return ++(this.currentId);
    }
}