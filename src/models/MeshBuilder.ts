import * as THREE from 'three';


export default class MeshBuilder {
    private geometry: THREE.Geometry;
    private material: THREE.Material;
    private _mesh: THREE.Mesh = null;

    constructor(material: THREE.Material) {
        this.geometry = new THREE.Geometry();
        this.material = material;
    }

    addVertex(x: number, y: number, z: number) {
        this.geometry.vertices.push(new THREE.Vector3(x, y, z));
    }

    addFace(v1: number, v2: number, v3: number) {
        this.geometry.faces.push(new THREE.Face3(v1, v2, v3));
    }

    build() {
        this.geometry.computeFaceNormals();
        const buffer = new THREE.BufferGeometry();
        buffer.fromGeometry(this.geometry);
        this._mesh = new THREE.Mesh(buffer, this.material); 
    }

    get mesh() {
        if (this._mesh === null) {
            this.build();
        }
        return this._mesh;
    }
}