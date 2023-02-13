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
        for (let j = 0.1; j < 5; j += 0.1) {
            points.push(new THREE.Vector3(j, j, j));
        }
        console.log(points)
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new MeshLine();
        line.setGeometry(geometry);
        
        // const line2 = new MeshLine();
        // line2.setPoints(points, p => 3);

        const material = new MeshLineMaterial();
        const mesh = new THREE.Mesh(line, material);
        this.scene.add(mesh);
    }
}