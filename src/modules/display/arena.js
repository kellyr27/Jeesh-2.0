import * as THREE from 'three'

import { CUBE_SIZE, ARENA_SIZE, DOOR_COORDINATES } from '../globals/game/constants.js'
import { adjustToDisplayCoordinate } from '../globals/game/coordinates.js'
import { arrayInArray,arrayEquals } from '../globals/array.js'
import { ARENA_COLOR_PALETTE } from '../globals/game/colors.js'
import StarsDisplay from './stars.js'

/**
 * Arena Threejs Display (or Battle Room)
 */
export default class Arena {

    cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
    cubeEdgesGeometry = new THREE.EdgesGeometry(this.cubeGeometry)
    cubeLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })

    colorPalette = ARENA_COLOR_PALETTE

    constructor(scene, starCoordinates) {
        this.scene = scene
        this.cubes = this.#createArena()
        this.currentHoveredCoordinate = [-1, -1, -1]
        this.#setDoors(DOOR_COORDINATES)
        this.stars = new StarsDisplay(scene, starCoordinates)
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
                color: this.colorPalette['default'],                                                            // -----
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
    #setCubeMaterialDefault(coord) {
        this.#setCubeMaterial(coord, this.colorPalette['default'], 0.03)
    }

    /**
     * Sets the Material of a Cube to be in the Attacked Zone of Army 1
     */
    #setCubeMaterialArmy1AttackedZone(coord) {
        this.#setCubeMaterial(coord, this.colorPalette['army1Attacked'], 0.5)
    }

    /**
     * Sets the Material of a Cube to be in the Attacked Zone of Army 2
     */
    #setCubeMaterialArmy2AttackedZone(coord) {
        this.#setCubeMaterial(coord, this.colorPalette['army2Attacked'], 0.5)
    }

    /**
     * Sets the Material of a Cube to be the in the Attacked Zone of both Armies
     */
    #setCubeMaterialDuelAttackedZone(coord) {
        this.#setCubeMaterial(coord, this.colorPalette['bothAttacked'], 0.2)
    }

    /**
     * Sets the Material of a Cube to be a possible move (from the Selection Panel)
     */
    #setCubeMaterialPossibleMove(coord) {
        this.#setCubeMaterial(coord, this.colorPalette['panelHovered'], 0.3)
    }

    resetHovered() {
        if (!arrayEquals(this.currentHoveredCoordinate, [-1, -1, -1])) {
            this.#setCubeMaterialDefault(this.currentHoveredCoordinate)
        }
        this.currentHoveredCoordinate = [-1, -1, -1]
    }

    setHovered(coord) {
        // Check whether there is currently an hovered coordinate
        if (!arrayEquals(this.currentHoveredCoordinate, [-1, -1, -1])) {
            this.#setCubeMaterialDefault(this.currentHoveredCoordinate)
        }

        // Check whether the new coord is valid
        if (!arrayEquals(coord, [-1, -1, -1])) {
            this.#setCubeMaterialPossibleMove(coord)
        }

        
        this.currentHoveredCoordinate = coord
    }

    /**
     * Sets the arena coloring at each position
     */
    setArena(army1AttackedZone, army2AttackedZone) {
        for (let x = 0; x < ARENA_SIZE; x++) {
            for (let y = 0; y < ARENA_SIZE; y++) {
                for (let z = 0; z < ARENA_SIZE; z++) {
                    const isInArmy1AttackedZone = arrayInArray([x, y, z], army1AttackedZone)
                    const isInArmy2AttackedZone = arrayInArray([x, y, z], army2AttackedZone)

                    if (isInArmy1AttackedZone && isInArmy2AttackedZone) {
                        this.#setCubeMaterialDuelAttackedZone([x, y, z])
                    }
                    else if (isInArmy1AttackedZone) {
                        this.#setCubeMaterialArmy1AttackedZone([x, y, z])
                    }
                    else if (isInArmy2AttackedZone) {
                        this.#setCubeMaterialArmy2AttackedZone([x, y, z])
                    }
                    else {
                        this.#setCubeMaterialDefault([x, y, z])
                    }
                }
            }
        }

        this.#setDoors(DOOR_COORDINATES)
    }



    /**
     * Sets the Material of a Cube to show the Door for both Armies
     */
    #setCubeMaterialDoor(coord) {
        this.#setCubeMaterial(coord, this.colorPalette['doors'], 0.5)
    }

    /**
     * Sets the Door Materials when creating the Arena
     */
    #setDoors(coords) {
        for (const coord of coords) {
            this.#setCubeMaterialDoor(coord)
        }
    }
}