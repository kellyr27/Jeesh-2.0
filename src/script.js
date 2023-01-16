import './style.css'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

const CUBE_SIZE = 1
const ARENA_SIZE = 11

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()


/**
 * Panel
 */
const canvas2 = document.getElementById('panel')
const ctx = canvas2.getContext('2d')

class SelectionPanel {
    /**
     * 
     */
    panelSplit = [0.15, 0.25, 0.2, 0.25, 0.15]
    panelSplitCumulative = this.panelSplit.map((sum => value => sum += value)(0))

    tileColorPalette = {
        scroll: {
            default: 'purple',
            hover: 'magenta',
            selected: 'green',
            blocked: 'grey'
        },
        selection: {
            default: 'red',
            hover: 'maroon',
            selected: 'green',
            blocked: 'grey'
        }
    }

    constructor(canvas) {
        this.canvas = canvas
        this.currentDirections = this.setInitialCurrentDirections()
        this.scrollTilePositions = this.setScrollTilePositions()
        this.currentSoldierNum = 0
    }

    /**
     * Set scroll tile positions
     */
    setScrollTilePositions () {
        return {
            up: [
                [0, 0],
                [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
                [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
                [this.canvas.width, 0]
            ],
            left: [
                [0, 0],
                [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
                [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
                [0, this.canvas.height]
            ],
            down: [
                [0, this.canvas.height],
                [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
                [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
                [this.canvas.width, this.canvas.height]
            ],
            right: [
                [this.canvas.width, this.canvas.height],
                [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
                [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
                [this.canvas.width, 0]
            ]
        }
    }

    /**
     * Sets the initial directions to Army 1
     */
    setInitialCurrentDirections() {
        return {
            face: '-z',
            up: '+y',
            down: '-y',
            left: '-x',
            right: '+x'
        }
    }
}


/**
 * Classes
 */

function adjustToDisplayCoordinate(x, y, z) {
    return [
        x + CUBE_SIZE / 2 - ARENA_SIZE / 2,
        y + CUBE_SIZE / 2 - ARENA_SIZE / 2,
        z + CUBE_SIZE / 2 - ARENA_SIZE / 2
    ]
}

function adjustToGameCoordinate(x, y, z) {
    return [
        x - CUBE_SIZE / 2 + ARENA_SIZE / 2,
        y - CUBE_SIZE / 2 + ARENA_SIZE / 2,
        z - CUBE_SIZE / 2 + ARENA_SIZE / 2
    ]
}


class Arena {

    cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
    cubeEdgesGeometry = new THREE.EdgesGeometry(this.cubeGeometry)
    cubeLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })

    constructor(scene) {
        this.scene = scene
        this.cubes = this.createCubes()
    }


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


        const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate(x, y, z)

        cubeMesh.position.set(xOffset, yOffset, zOffset)
        cubeLine.position.set(xOffset, yOffset, zOffset)
        this.scene.add(cubeMesh, cubeLine)

        return cubeMesh
    }

    createCubes() {
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
     * Cube material codes are (in order of priority):
     * 0 - Transparent (Default)
     * 1 - Attacked Cube of Army 1
     * 2 - Attacked Cube of Army 2
     * 3 - Attacked Cube of both Army 1 & Army 2
     * 4 - Door
     */
    setCubeColorCode(x, y, z, code) {
        if (code === 0) {
            this.#setCubeColor(x, y, z, 0xffff00, 0.03)
            return
        }
        else if (code === 1) {
            this.#setCubeColor(x, y, z, 0x00ff00, 0.5)
            return
        }
        else if (code === 2) {
            this.#setCubeColor(x, y, z, 0xff0000, 0.5)
            return
        }
        else if (code === 3) {
            this.#setCubeColor(x, y, z, 0xff00ff, 0.2)
            return
        }
        else if (code === 4) {
            this.#setCubeColor(x, y, z, 0xffff00, 0.5)
            return
        }
        else {
            console.error('Cube material code was incorrectly inputted.')
        }
    }

    #setCubeColor(x, y, z, color, opacity) {
        this.cubes[x][y][z].material.color.setHex(color)
        this.cubes[x][y][z].material.opacity = opacity
    }


}

class StarsDisplay {

    starGeometry = new THREE.OctahedronGeometry(0.5, 0)
    starEdgeGeometry = new THREE.EdgesGeometry(this.starGeometry)
    starEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
    starMaterial = new THREE.MeshBasicMaterial({ color: 0x101010 })

    constructor(scene, coordinates) {
        this.scene = scene
        this.stars = this.createStars(coordinates)
    }

    #createStar(coordinate) {
        let starMesh = new THREE.Mesh(this.starGeometry, this.starMaterial)
        let starLine = new THREE.LineSegments(this.starEdgeGeometry, this.starEdgeMaterial)

        const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate(coordinate[0], coordinate[1], coordinate[2])

        starMesh.position.set(xOffset, yOffset, zOffset)
        starLine.position.set(xOffset, yOffset, zOffset)

        this.scene.add(starMesh, starLine)

        return starMesh
    }

    createStars(coordinates) {
        let starsArray = []

        for (const coordinate of coordinates) {
            starsArray.push(this.#createStar(coordinate))
        }

        return starsArray
    }
}

/**
 * Checks if two arrays are equal (COPY TO REMOVE)
 */
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}


class ArmyDisplay {

    constructor(scene, positions) {
        this.scene = scene
        this.soldiers = this.createSoldiers(positions)
    }

    orientateSoldier(soldier, direction) {
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
            soldier[0].rotation.setFromVector3(new THREE.Vector3(0, 0, - Math.PI / 2))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(0, 0, - Math.PI / 2))
        }
        else if (arrayEquals(direction, [0, 0, -1])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(0, 0, Math.PI / 2))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(0, 0, Math.PI / 2))
        }
        else {
            console.log(direction)
            console.error('Direction inputted incorrectly.')
        }
    }

    #createSoldier(position, index) {
        let coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        let coneGeometry = new THREE.ConeGeometry(0.4, 0.8, 20)
        let coneEdgeGeometry = new THREE.EdgesGeometry(coneGeometry)
        let coneEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })

        let coneMesh = new THREE.Mesh(
            coneGeometry,
            coneMaterial
        )

        coneMesh.index = index

        let coneLine = new THREE.LineSegments(
            coneEdgeGeometry,
            coneEdgeMaterial
        )

        const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate(position[0][0], position[0][1], position[0][2])

        coneMesh.position.set(xOffset, yOffset, zOffset)
        coneLine.position.set(xOffset, yOffset, zOffset)

        this.scene.add(coneMesh, coneLine)

        return [coneMesh, coneLine]
    }

    createSoldiers(positions) {
        const soldiers = []

        for (const [index, position] of positions.entries()) {
            const soldier = this.#createSoldier(position, index)
            soldiers.push(soldier)
            this.orientateSoldier(soldier, position[1])
        }

        return soldiers
    }

    getSoldiers() {
        return this.soldiers.map((el) => {
            return el[0]
        })
    }

    getSoldierPosition(soldierNum) {
        const { x, y, z } = this.soldiers[soldierNum][0].position
        return [x, y, z]
    }

    getSoldierRotation(soldierNum) {
        const { x, y, z } = this.soldiers[soldierNum][0].rotation
        return [x, y, z]
    }

    updateSoldierPosition(soldierNum, x, y, z) {

        // const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate(x, y, z)

        this.soldiers[soldierNum][0].position.set(x, y, z)
        this.soldiers[soldierNum][1].position.set(x, y, z)
    }

    updateSoldierRotation(soldierNum, x, y, z) {

        // const [xOffset, yOffset, zOffset] = adjustToDisplayCoordinate(x, y, z)

        this.soldiers[soldierNum][0].rotation.set(x, y, z)
        this.soldiers[soldierNum][1].rotation.set(x, y, z)
    }

    setSelectedColor(soldierNum) {
        this.soldiers[soldierNum][0].material.color.setHex(0x00ff00)
    }

    setHoveredColor(soldierNum) {
        this.soldiers[soldierNum][0].material.color.setHex(0x0000ff)
    }

    setDefaultColor(soldierNum) {
        this.soldiers[soldierNum][0].material.color.setHex(0xff0000)
    }
}

/**
 * Axes helper
 */
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

// Does not work on Safari browser
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen()
    }
    else {
        document.exitFullscreen()
    }
})

/**
 * Cursor
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (evt) => {
    mouse.x = 2 * (evt.clientX / sizes.width) - 1
    mouse.y = - (2 * (evt.clientY / sizes.height) - 1)
})

/**
 * Camera
 */
const aspectRatio = sizes.width / sizes.height
const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 100)
camera.position.set(0, 0, ARENA_SIZE + 3)
scene.add(camera)

/**
 * Controls
 */
const controls = new TrackballControls(camera, canvas)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)


let testArena = new Arena(scene)
let stars = new StarsDisplay(scene, [[1, 1, 1], [2, 1, 1]])
let testArmy = new ArmyDisplay(scene, [[[5, 5, 10], [1, 0, 0]], [[5, 4, 10], [1, 0, 0]]])
let testPanel = new SelectionPanel(canvas2)

/**
 * Animations
 */
const clock = new THREE.Clock()
const MOVE_TIME = 3
let mouseStart = false
let inMotion = false
let userRayCaster = {
    hoveredSoldier: -1,
    selectedSoldier: -1
}
let userMove = {
    startingFlag: true,
    startTime: -1,
    soldierNum: -1,
    startXPosition: -1,
    startYPosition: -1,
    startZPosition: -1,
    startXRotation: -1,
    startYRotation: -1,
    startZRotation: -1,
    finishX: -1,
    finishY: -1,
    finishZ: -1,
    finishXRotation: -1,
    finishYRotation: -1,
    finishZRotation: -1,
    setStartingParameters: (startTime, startXPosition, startYPosition, startZPosition, startXRotation, startYRotation, startZRotation) => {
        this.startTime = startTime
        this.startXPosition = startXPosition
        this.startYPosition = startYPosition
        this.startZPosition = startZPosition
        this.startXRotation = startXRotation
        this.startYRotation = startYRotation
        this.startZRotation = startZRotation
        this.startingFlag = false
    },
    resetStartingFlag: () => {
        this.startingFlag = true
    },
    getStartingFlag: () => {
        return this.startingFlag
    },
    getCurrentPositions: () => {

    },

}

function recordUserMoveStartingParameters() {

}

/**
 * 
 */
canvas.addEventListener('click', (evt) => {
    if (userRayCaster.hoveredSoldier !== -1) {
        if (userRayCaster.selectedSoldier !== -1) {
            testArmy.setDefaultColor(userRayCaster.selectedSoldier)
        }
        userRayCaster.selectedSoldier = userRayCaster.hoveredSoldier
        testArmy.setSelectedColor(userRayCaster.selectedSoldier)
    }
    else if (userRayCaster.selectedSoldier !== -1) {
        testArmy.setDefaultColor(userRayCaster.selectedSoldier)
    }
})

canvas.addEventListener('contextmenu', (evt) => {
    if (userRayCaster.selectedSoldier !== -1) {
        if (userRayCaster.hoveredSoldier === userRayCaster.selectedSoldier) {
            testArmy.setHoveredColor(userRayCaster.selectedSoldier)
        }
        else {
            testArmy.setDefaultColor(userRayCaster.selectedSoldier)
        }

        userRayCaster.selectedSoldier = -1
    }
})

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    /**
     * 
     */
    raycaster.setFromCamera(mouse, camera)


    if (!inMotion) {
        // Cast a ray
        let intersectedSoldier = raycaster.intersectObjects(testArmy.getSoldiers())
        const previousIntersectedSoldierIndex = userRayCaster.hoveredSoldier

        // If the cursor is currently hovering over an Soldier
        if (intersectedSoldier.length !== 0) {
            const currentIntersectedSoldierIndex = intersectedSoldier[0].object.index

            // If the Soldier is being hovered over for the first time
            if (currentIntersectedSoldierIndex !== previousIntersectedSoldierIndex) {

                if ((previousIntersectedSoldierIndex !== -1) && (previousIntersectedSoldierIndex !== userRayCaster.selectedSoldier)) {
                    testArmy.setDefaultColor(previousIntersectedSoldierIndex)
                }

                if (currentIntersectedSoldierIndex !== userRayCaster.selectedSoldier) {
                    testArmy.setHoveredColor(currentIntersectedSoldierIndex)
                }
            }

            userRayCaster.hoveredSoldier = currentIntersectedSoldierIndex
        }

        else {
            if ((previousIntersectedSoldierIndex !== -1) && (previousIntersectedSoldierIndex !== userRayCaster.selectedSoldier)) {
                testArmy.setDefaultColor(previousIntersectedSoldierIndex)
            }

            userRayCaster.hoveredSoldier = -1
        }
    }

    // Check whether motion time has finished
    if (inMotion) {

        if (userMove.getStartingFlag()) {

            const [xPosition, yPosition, zPosition] = testArmy.getSoldierPosition(userMove.soldierNum)
            const [xRotation, yRotation, zRotation] = testArmy.getSoldierRotation(userMove.soldierNum)

            userMove.setStartingParameters(elapsedTime, xPosition, yPosition, zPosition, xRotation, yRotation, zRotation)
        }

        const elapsedTimeInMotion = elapsedTime - userMove.startTime

        testArmy.updateSoldierPosition(
            userMove.soldierNum,
            userMove.startXPosition + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishX - userMove.startX),
            userMove.startYPosition + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishY - userMove.startY),
            userMove.startZPosition + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishZ - userMove.startZ)
        )

        testArmy.updateSoldierRotation(
            userMove.soldierNum,
            userMove.startXRotation + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishXRotation - userMove.startXRotation),
            userMove.startYRotation + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishYRotation - userMove.startYRotation),
            userMove.startZRotation + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishZRotation - userMove.startZRotation)
        )

        if (elapsedTimeInMotion >= MOVE_TIME) {
            inMotion = false
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)

}

tick()

