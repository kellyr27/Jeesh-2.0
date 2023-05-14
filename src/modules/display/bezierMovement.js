const bezier = require('bezier-curve')
import { subtractArrays, addArrays } from '../globals/array';
import * as THREE from 'three';

function getBezierPoints(points) {
    const newPoints = []

    for (var t = 0; t < 1; t += 0.01) {
        var point = bezier(t, points);
        newPoints.push(new THREE.Vector3(point[0], point[1], point[2]))
    }

    return newPoints
}


function getSpecializedMidPoint(p1, p2) {
    return [
        p1[0],
        addArrays(subtractArrays(subtractArrays(p2[0], p1[0]), p2[1]), p1[0]),
        p2[0]
    ]
}

/**
 * Using De Casteljaus Algorithm
 */
function mix (a, b, t) {
    return a * (1 - t) + b*t;
}
 
function BezierQuadratic (A, B, C, t)
{
    // degree 2
    const AB = mix(A, B, t);
    const BC = mix(B, C, t);
    return mix(AB, BC, t);
}

export function BezierQuadraticThreeDim (A, B, C, t) {
    const x = BezierQuadratic(A[0], B[0], C[0], t)
    const y = BezierQuadratic(A[1], B[1], C[1], t)
    const z = BezierQuadratic(A[2], B[2], C[2], t)
    return [x,y,z]
}