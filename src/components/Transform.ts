import GameComponent from "./GameComponent";

export default class Transform extends GameComponent {
    x: number;      // Longitude
    y: number;      // Latitude
    z: number;      // Elevation/Altitude
    rotX: number;   // Pitch
    rotY: number;   // Roll
    rotZ: number;   // Yaw/Heading

    constructor(
        { x, y, z }: { x: number, y: number, z: number },
        { rotX, rotY, rotZ }: { rotX: number, rotY: number, rotZ: number },
        id: number, entityId: number
    ) {
        super(id, entityId);
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotX = rotX;
        this.rotY = rotY;
        this.rotZ = rotZ;
    }

    /**
     * Alias for X position
     */
    get lon() {
        return this.x;
    }

    set lon(value) {
        this.x = value;
    }

    /**
     * Alias for Y position
     */
    get lat() {
        return this.y;
    }

    set lat(value) {
        this.y = value;
    }

    /**
     * Alias for Z position
     */
    get alt() {
        return this.z;
    }

    set alt(value) {
        this.z = value;
    }

    /**
     * Alias for Z rotation
     */
    get heading() {
        return this.rotZ;
    }

    set heading(value) {
        this.rotZ = value;
    }

    /**
     * Alias for X position
     */
    get lateral() {
        return this.x;
    }

    set lateral(value) {
        this.x = value;
    }

    /**
     * Alias for Y position
     */
    get forward() {
        return this.y;
    }

    set forward(value) {
        this.y = value;
    }

    /**
     * Alias for Z position
     */
    get vertical() {
        return this.z;
    }

    set vertical(value) {
        this.z = value;
    }
}