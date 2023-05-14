import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { adjustListToDisplayCoordinate, subtractArrays, addArrays, arrayEquals } from '../globals';
import { getSpecializedMidPoint } from './bezierMovement';

const bezier = require('bezier-curve')

/**
 * 
 */
function getBezierPoints(points, max) {
    const newPoints = []

    for (var t = 0; t < max; t += 0.01) {
        var point = bezier(t, points);
        newPoints.push(new THREE.Vector3(point[0], point[1], point[2]))
    }

    return newPoints
}

function getStartingPoints (startingPosition) {
    const startingCoordinate = startingPosition[0]
    const startingRotation = startingPosition[1]
    const TOLERANCE = 0.05


    if (startingRotation[0] !== 0) {
        return [
            addArrays(startingCoordinate, [-TOLERANCE, 0, 0]),
            addArrays(startingCoordinate, [TOLERANCE, 0, 0])
        ]
    }
    else if (startingRotation[1] !== 0) {
        return [
            addArrays(startingCoordinate, [0, -TOLERANCE, 0]),
            addArrays(startingCoordinate, [0, TOLERANCE, 0])
        ]
    }
    else {
        return [
            addArrays(startingCoordinate, [0, 0, -TOLERANCE]),
            addArrays(startingCoordinate, [0, 0, TOLERANCE])
        ]
    }
}

class LineDisplay {

    constructor(scene, armyCoords, color, isInitial, max) {
        this.scene = scene
        this.color = color
        this.currentFacingDirection = [0, 0, 1]

        if (isInitial) {
            this.createInitial(armyCoords)
        }
        else {
            this.create(armyCoords, max)
        }
    }

    /**
     * 
     */
    createInitial(initialPosition) {
        this.geometry = new THREE.BufferGeometry().setFromPoints(getBezierPoints(adjustListToDisplayCoordinate(getStartingPoints(initialPosition)), 1));
        this.line = new MeshLine();
        this.line.setGeometry(this.geometry);

        this.material = new MeshLineMaterial({
            color: this.color,
            opacity: 0.9,
            lineWidth: 0.1
        })
        this.mesh = new THREE.Mesh(this.line, this.material)
        this.scene.add(this.mesh)
    }

    create(coords, max) {

        let points = getBezierPoints(adjustListToDisplayCoordinate(getSpecializedMidPoint(coords[0], coords[1])), max)

        this.geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.line = new MeshLine();
        this.line.setGeometry(this.geometry);

        this.material = new MeshLineMaterial({
            color: this.color,
            opacity: 0.9,
            lineWidth: 0.1
        })
        this.mesh = new THREE.Mesh(this.line, this.material)
        this.scene.add(this.mesh)
    }

    setDead() {
        this.mesh.material.color.set('black')
        this.mesh.material.opacity = 0.8
        this.mesh.material.lineWidth = 0.1
    }

    dispose() {
        this.line.dispose()
        this.geometry.dispose()
        this.material.dispose()
        this.scene.remove(this.mesh)
    }
}

export default class LineArmy {
    constructor (scene, startingPositions, color) {
        this.scene = scene
        this.color = color
        this.initialize(startingPositions)
        this.tempMotionLine = null
    }

    /**
     * Sets a short Line to display so if they die without moving, path still visible
     */
    initialize (startingPositions) {
        this.armyLines = []

        for (const startingPosition of startingPositions) {
            const soldierLines = [new LineDisplay(this.scene, startingPosition, this.color, true)]
            this.armyLines.push(soldierLines)
        }
    }

    setMotionLine (coords, percentage) {
        if (this.tempMotionLine) {
            this.tempMotionLine.dispose()
        }
        this.tempMotionLine = new LineDisplay(this.scene, coords, this.color, false, percentage)
    }

    setFinalLine (soldierIndex, coords) {
        if (this.tempMotionLine) {
            this.tempMotionLine.dispose()
        }
        this.armyLines[soldierIndex].push(new LineDisplay(this.scene, coords, this.color, false, 1))
    }

    setDead(soldierNums) {
        for (const soldierNum of soldierNums) {

            // Set every Line of a Soldier to DEAD color
            for (const line of this.armyLines[soldierNum]) {
                line.setDead()
            }
        }
    }
}