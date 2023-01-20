import * as THREE from 'three'
import {adjustToDisplayCoordinate} from '../globals.js'

/**
 * Stars Display
 */
export default class StarsDisplay {

    starGeometry = new THREE.OctahedronGeometry(0.5, 0)
    starEdgeGeometry = new THREE.EdgesGeometry(this.starGeometry)
    starEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
    starMaterial = new THREE.MeshBasicMaterial({ color: 0x101010 })

    constructor(scene, coords) {
        this.scene = scene
        this.stars = this.#createStars(coords)
    }

    /**
     * Creates single Threejs Star object
     */
    #createStar(coord) {
        let starMesh = new THREE.Mesh(this.starGeometry, this.starMaterial)
        let starLine = new THREE.LineSegments(this.starEdgeGeometry, this.starEdgeMaterial)

        const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate(coord)

        starMesh.position.set(xOffset, yOffset, zOffset)
        starLine.position.set(xOffset, yOffset, zOffset)

        this.scene.add(starMesh, starLine)

        return starMesh
    }

    #createStars(coords) {
        let starsArray = []

        for (const coord of coords) {
            starsArray.push(this.#createStar(coord))
        }

        return starsArray
    }
}