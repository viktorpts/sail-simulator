import GameComponent from "./GameComponent";

export default class Transform extends GameComponent {
    x: number;      // Longitude
    y: number;      // Latitude
    z: number;      // Elevation/Altitude
    rotX: number;   // Pitch
    rotY: number;   // Roll
    rotZ: number;   // Yaw/Heading

    /**
     * Create origin Transform
     * @param id Component ID
     * @param entityId Parent Entity ID
     */
    constructor(id: number, entityId: number);
    /**
     * Create Transorm with position and rotation values
     * @param position Position value
     * @param rotation Rotation value 
     * @param id Component ID
     * @param entityId Parent Entity ID
     */
    constructor(
        { x, y, z }: { x: number, y: number, z: number },
        { rotX, rotY, rotZ }: { rotX: number, rotY: number, rotZ: number },
        id: number, entityId: number
    );
    constructor(
        position: any,
        rotation: any,
        id?: number, entityId?: number
    ) {
        if (typeof position === 'number' && typeof rotation === 'number') {
            super(position, rotation);
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.rotX = 0;
            this.rotY = 0;
            this.rotZ = 0;
        } else {
            super(id, entityId);
            this.x = position.x;
            this.y = position.y;
            this.z = position.z;
            this.rotX = rotation.rotX;
            this.rotY = rotation.rotY;
            this.rotZ = rotation.rotZ;
        }
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