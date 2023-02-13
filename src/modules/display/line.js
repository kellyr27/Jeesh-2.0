import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const bezier = require('bezier-curve');

export default class LineDisplay {

    constructor(scene) {
        this.scene = scene
        this.test()
    }

    test() {
        const points = [];
        for (let j = 0.1; j < 10; j += 0.1) {
            points.push(new THREE.Vector3(j, j, j));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new MeshLine();
        line.setGeometry(geometry);

        const material = new MeshLineMaterial({
            color: 'blue',
            opacity: 0.9,
            lineWidth: 0.1
        });
        const mesh = new THREE.Mesh(line, material);
        this.scene.add(mesh);
    }
}