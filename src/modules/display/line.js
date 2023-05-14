import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { adjustListToDisplayCoordinate, subtractArrays, addArrays, arrayEquals } from '../globals';
import { getSpecializedMidPoint } from './bezierMovement';

const bezier = require('bezier-curve')

/**
 * 
 */
function getBezierPoints(points) {
    const newPoints = []

    for (var t = 0; t < 1; t += 0.01) {
        var point = bezier(t, points);
        newPoints.push(new THREE.Vector3(point[0], point[1], point[2]))
    }

    return newPoints
}
export default class LineDisplay {

    constructor(scene, armyCoords, color) {
        this.scene = scene
        this.color = color
        this.currentFacingDirection = [0, 0, 1]
        this.create(armyCoords)
    }

    create(coords) {
        let points = getBezierPoints(adjustListToDisplayCoordinate(getSpecializedMidPoint(coords[0], coords[1])))

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new MeshLine();
        line.setGeometry(geometry);

        const material = new MeshLineMaterial({
            color: this.color,
            opacity: 0.9,
            lineWidth: 0.1
        })
        this.mesh = new THREE.Mesh(line, material)
        this.scene.add(this.mesh)
    }

    setDead() {
        this.mesh.material.color.set('red')
        this.mesh.material.opacity = 0.5
        this.mesh.material.lineWidth = 0.5
    }
}