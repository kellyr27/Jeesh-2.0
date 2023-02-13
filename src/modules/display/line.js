import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const bezier = require('bezier-curve');

export default class LineDisplay {

    constructor(scene) {
        this.scene = scene
        console.log(bezier)
        this.test()
    }

    test() {
        const points = [];
        // for (let j = 0.1; j < 10; j += 0.1) {
        //     points.push(new THREE.Vector3(j, j, j));
        // }

        
        var points1 = [
            [-1.0, 0.0, 0.0],
            [-0.5, 0.5, 0.0],
            [0.5, -0.5, 0.0],
            [1.0, 0.0, 0.0]
        ];

        for (var t = 0; t < 1; t += 0.01) {
            var point = bezier(t, points1);
            points.push(new THREE.Vector3(point[0], point[1], point[2]))
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