import * as THREE from 'three'
import { arrayEquals } from '../globals/array.js'
import { adjustToDisplayCoordinate } from '../globals.js'

/**
 * Army Display (Soldiers)
 */
export default class ArmyDisplay {

    /**
     * Color palette for the Soldiers depending on the Army choosen
     */
    colorPalette = {
        0: {
            default: 'red',
            hovered: 'blue',
            selected: 'green'
        },
        1: {
            default: 'purple',
            hovered: 'blue',
            selected: 'green'
        }
    }

    constructor(scene, armyNum, startingPositions) {
        this.scene = scene
        this.armyNum = armyNum
        this.soldiers = this.#createSoldiers(startingPositions)
    }

    /**
     * Orientates the Soldier to face their starting direction.
     */
    #orientateSoldier(soldier, direction) {
        if (arrayEquals(direction, [1, 0, 0])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(0, 0, Math.PI / 2))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(0, 0, Math.PI / 2))
        }
        else if (arrayEquals(direction, [-1, 0, 0])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(0, 0, - Math.PI / 2))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(0, 0, - Math.PI / 2))
        }
        else if (arrayEquals(direction, [0, 1, 0])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(Math.PI, 0, 0))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(Math.PI, 0, 0))
        }
        else if (arrayEquals(direction, [0, -1, 0])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(0, 0, 0))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(0, 0, 0))
        }
        else if (arrayEquals(direction, [0, 0, 1])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(- Math.PI / 2, 0, 0))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(- Math.PI / 2, 0, 0))
        }
        else if (arrayEquals(direction, [0, 0, -1])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(Math.PI / 2, 0, 0))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(Math.PI / 2, 0, 0))
        }
        else {
            console.error('Direction inputted incorrectly.')
        }
    }

    /**
     * Creates a single Soldier object in Three js
     */
    #createSoldier(position, index) {
        let coneMaterial = new THREE.MeshBasicMaterial({ color: this.colorPalette[this.armyNum].default })
        let coneGeometry = new THREE.ConeGeometry(0.4, 0.8, 20)
        let coneEdgeGeometry = new THREE.EdgesGeometry(coneGeometry)
        let coneEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })

        let coneMesh = new THREE.Mesh(
            coneGeometry,
            coneMaterial
        )
        let coneLine = new THREE.LineSegments(
            coneEdgeGeometry,
            coneEdgeMaterial
        )
        coneMesh.index = index
        // coneMesh.isDead = false

        const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate(position[0])

        coneMesh.position.set(xOffset, yOffset, zOffset)
        coneLine.position.set(xOffset, yOffset, zOffset)

        this.scene.add(coneMesh, coneLine)

        return [coneMesh, coneLine]
    }

    #createSoldiers(positions) {
        const soldiers = []

        for (let i = 0; i < positions.length; i++) {
            const soldier = this.#createSoldier(positions[i], i)
            soldiers.push(soldier)
            this.#orientateSoldier(soldier, positions[i][1])
        }

        return soldiers
    }

    /**
     * Returns a list of the Soldiers (only the Threejs Mesh - not the Outline)
     */
    getSoldiers() {
        return this.soldiers
            .map((el) => {
                return el[0]
            })
            .filter((el) => {
                return el.visible
            })
    }

    getSoldierIndex(soldierMesh) {
        return soldierMesh.index
    }

    getSoldierPosition(soldierNum) {
        const { x, y, z } = this.soldiers[soldierNum][0].position
        return [x, y, z]
    }

    // getSoldierRotation(soldierNum) {
    //     const { x, y, z } = this.soldiers[soldierNum][0].rotation
    //     return [x, y, z]
    // }

    setSoldierPosition(soldierNum, x, y, z) {

        const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate([x, y, z])

        this.soldiers[soldierNum][0].position.set(xOffset, yOffset, zOffset)
        this.soldiers[soldierNum][1].position.set(xOffset, yOffset, zOffset)
    }

    setSoldierRotation(soldierNum, axis, magnitude) {
        if (axis === 0) {
            this.soldiers[soldierNum][0].rotateX(magnitude)
            this.soldiers[soldierNum][1].rotateX(magnitude)
        }
        else if (axis === 1) {
            this.soldiers[soldierNum][0].rotateY(magnitude)
            this.soldiers[soldierNum][1].rotateY(magnitude)
        }
        else if (axis === 2) {
            this.soldiers[soldierNum][0].rotateZ(magnitude)
            this.soldiers[soldierNum][1].rotateZ(magnitude)
        }
    }

    setSelectedColor(soldierNum) {
        this.soldiers[soldierNum][0].material.color.set(this.colorPalette[this.armyNum]['selected'])
    }

    setHoveredColor(soldierNum) {
        this.soldiers[soldierNum][0].material.color.set(this.colorPalette[this.armyNum]['hovered'])
    }

    setDefaultColor(soldierNum) {
        this.soldiers[soldierNum][0].material.color.set(this.colorPalette[this.armyNum]['default'])
    }

    setNoVisibility(soldierNums) {
        for (const soldierNum of soldierNums) {
            this.soldiers[soldierNum][0].visible = false
            this.soldiers[soldierNum][1].visible = false
        }
    }
}