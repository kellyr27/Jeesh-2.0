import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { adjustListToDisplayCoordinate } from '../globals';

const bezier = require('bezier-curve')
const BEZIER_ACCURACY = 20

/**
 * 
 */
function getLineMidPoints (coords) {
    const newPoints = []

    for (let i = 1; i < coords.length; i++) {
        newPoints.push(
            coords[i - 1],
            ...getMidPoints(BEZIER_ACCURACY, coords[i - 1], coords[i])
        )
    }

    return newPoints
}

/**
 * Takes two coorindates (in 3 dim), returns list of points evenly distributed between the two coordinates.
 */
function getMidPoints(numOfPoints, p1, p2) {
    let midPoints = []
    
    for (let i = 1; i < numOfPoints; i++) {
        midPoints.push([
            p1[0] + (i * (p2[0] - p1[0])) / numOfPoints,
            p1[1] + (i * (p2[1] - p1[1])) / numOfPoints,
            p1[2] + (i * (p2[2] - p1[2])) / numOfPoints
        ])
    }

    return midPoints
}

export default class LineDisplay {

    constructor(scene, coords) {
        this.scene = scene
        console.log(bezier)
        this.test(coords)
    }

    test(coords) {
        const points = [];
        // for (let j = 0.1; j < 10; j += 0.1) {
        //     points.push(new THREE.Vector3(j, j, j));
        // }


        // var points1 = [
        //     [-1.0, 0.0, 0.0],
        //     [-0.5, 0.5, 0.0],
        //     [0.5, -0.5, 0.0],
        //     [1.0, 0.0, 0.0]
        // ];

        let points1 = adjustListToDisplayCoordinate(getLineMidPoints(coords))

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
        console.log(mesh)
        this.scene.add(mesh);
    }
}