import * as THREE from 'three'
import { CUBE_SIZE, ARENA_SIZE, adjustToDisplayCoordinate } from "../globals.js"

/**
 * Arena Threejs Display (or Battle Room)
 */
export default class Arena {

    cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
    cubeEdgesGeometry = new THREE.EdgesGeometry(this.cubeGeometry)
    cubeLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })

    constructor(scene) {
        this.scene = scene
        this.cubes = this.#createArena()
        this.#setDoors([5,5,0],[5,5,10])
    }

    /**
     * Creates the Arena
     */
    #createArena() {
        let cubes = []

        for (let x = 0; x < ARENA_SIZE; x++) {
            let xArray = []
            for (let y = 0; y < ARENA_SIZE; y++) {
                let yArray = []
                for (let z = 0; z < ARENA_SIZE; z++) {
                    yArray.push(this.#createCube(x, y, z))
                }
                xArray.push(yArray)
            }
            cubes.push(xArray)
        }

        return cubes
    }

    /**
     * Creates a Cube Threejs object
     */
    #createCube(x, y, z) {
        let cubeMesh = new THREE.Mesh(
            this.cubeGeometry,
            new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.03
            })
        )

        let cubeLine = new THREE.LineSegments(
            this.cubeEdgesGeometry,
            this.cubeLineMaterial)


        const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate([x, y, z])

        cubeMesh.position.set(xOffset, yOffset, zOffset)
        cubeLine.position.set(xOffset, yOffset, zOffset)
        this.scene.add(cubeMesh, cubeLine)

        return cubeMesh
    }

    /**
     * Sets the Material of a given cube
     * Material includes the color and opacity
     */
    #setCubeMaterial(coord, color, opacity) {
        const [x, y, z] = coord
        this.cubes[x][y][z].material.color.setHex(color)
        this.cubes[x][y][z].material.opacity = opacity
    }

    /**
     * Sets the Material of a Cube to be transparent
     */
    setCubeMaterialDefault (coord) {
        this.#setCubeMaterial(coord, 0xffff00, 0.03)
    }

    /**
     * Sets the Material of a Cube to be in the Attacked Zone of Army 1
     */
    setCubeMaterialArmy1AttackedZone (coord) {
        this.#setCubeMaterial(coord, 0x00ff00, 0.5)
    }

    /**
     * Sets the Material of a Cube to be in the Attacked Zone of Army 2
     */
    setCubeMaterialArmy2AttackedZone (coord) {
        this.#setCubeMaterial(coord, 0xff0000, 0.5)
    }

    /**
     * Sets the Material of a Cube to be the in the Attacked Zone of both Armies
     */
    setCubeMaterialDuelAttackedZone (coord) {
        this.#setCubeMaterial(coord, 0xff00ff, 0.2)
    }

    /**
     * Sets the Material of a Cube to show the Door for both Armies
     */
    #setCubeMaterialDoor (coord) {
        this.#setCubeMaterial(coord, 0xffff00, 0.5)
    }

    /**
     * Sets the Door Materials when creating the Arena
     */
    #setDoors (...coords) {
        for (const coord of coords) {
            this.#setCubeMaterialDoor(coord)
        }
    }
}