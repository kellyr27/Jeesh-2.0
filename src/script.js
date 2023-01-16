import './style.css'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

const CUBE_SIZE = 1
const ARENA_SIZE = 11

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
            soldier[0].geometry.rotateZ(Math.PI / 2)
            soldier[1].geometry.rotateZ(Math.PI / 2)
        }
        else if (arrayEquals(direction, [-1, 0, 0])) {
            soldier[0].geometry.rotateZ(-Math.PI / 2)
            soldier[1].geometry.rotateZ(-Math.PI / 2)
        }
        else if (arrayEquals(direction, [0, 1, 0])) {
            soldier[0].rotation.setFromVector3(new THREE.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2))
            soldier[1].rotation.setFromVector3(new THREE.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2))
        }
        else if (arrayEquals(direction, [0, -1, 0])) {

        }
        else if (arrayEquals(direction, [0, 0, 1])) {
            soldier[0].geometry.rotateX(-Math.PI / 2)
            soldier[1].geometry.rotateX(-Math.PI / 2)
        }
        else if (arrayEquals(direction, [0, 0, -1])) {
            soldier[0].geometry.rotateX(Math.PI / 2)
            soldier[1].geometry.rotateX(Math.PI / 2)
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

    setHoveredColor (soldierNum) {
        this.soldiers[soldierNum][0].material.color.setHex(0x0000ff)
    }

    setDefaultColor (soldierNum) {
        this.soldiers[soldierNum][0].material.color.setHex(0xff0000)
    }
}

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

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
let testArmy = new ArmyDisplay(scene, [[[5, 5, 10], [0, 1, 0]], [[5, 4, 10], [0, 0, 1]]])

/**
 * Animations
 */
const clock = new THREE.Clock()
const moveTime = 3
let mouseStart = false
let inMotion = false
let userRayCaster = {
    hoveredSoldier: -1,
    selectedSoldier: -1
}

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    /**
     * 
     */
    raycaster.setFromCamera(mouse, camera)


    if (!inMotion) {
        // Cast a ray
        let intersectedSoldier = raycaster.intersectObjects(testArmy.getSoldiers())

        if (intersectedSoldier.length !== 0) {
            const currentIntersectedSoldierIndex = intersectedSoldier[0].object.index
            // Check if user has hovered to an new Soldier
            if (currentIntersectedSoldierIndex !== userRayCaster.hoveredSoldier) {
                if (userRayCaster.hoveredSoldier === -1) {
                    testArmy.setHoveredColor(currentIntersectedSoldierIndex)
                }
                else {
                    testArmy.setDefaultColor(userRayCaster.hoveredSoldier)
                    testArmy.setHoveredColor(currentIntersectedSoldierIndex)
                }
            }

            userRayCaster.hoveredSoldier = currentIntersectedSoldierIndex
        }

        else {
            if (userRayCaster.hoveredSoldier !== -1) {
                testArmy.setDefaultColor(userRayCaster.hoveredSoldier)
            }

            userRayCaster.hoveredSoldier = -1
        }



        // console.log(userRayCaster.hoveredSoldier)

    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)

}

tick()

