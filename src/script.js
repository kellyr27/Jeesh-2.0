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

/**
 * Animations
 */
const clock = new THREE.Clock()
const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // Cast a ray
    raycaster.setFromCamera(mouse, camera)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)

}

tick()

/**
 * Classes
 */

class Arena {

    cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)
    cubeEdgesGeometry = new THREE.EdgesGeometry(this.cubeGeometry)
    cubeLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })

    constructor(scene) {
        this.scene = scene
        // this.cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)

        this.cubes = this.createCubes()
    }

    /**
     * Centres the Arena display to (0,0,0)
     */
    #adjustToDisplayCoordinate(x, y, z) {
        return [
            x + CUBE_SIZE / 2 - ARENA_SIZE / 2,
            y + CUBE_SIZE / 2 - ARENA_SIZE / 2,
            z + CUBE_SIZE / 2 - ARENA_SIZE / 2
        ]
    }

    #createCube(x, y, z) {
        let cube = new THREE.Mesh(
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


        const [xOffset, yOffset, zOffset] = this.#adjustToDisplayCoordinate(x, y, z)

        cube.position.set(xOffset, yOffset, zOffset)
        cubeLine.position.set(xOffset, yOffset, zOffset)
        this.scene.add(cube, cubeLine)

        return cube
    }

    createCubes() {
        let cubesArray = []

        for (let x = 0; x < ARENA_SIZE; x++) {
            let xArray = []
            for (let y = 0; y < ARENA_SIZE; y++) {
                let yArray = []
                for (let z = 0; z < ARENA_SIZE; z++) {
                    yArray.push(this.#createCube(x, y, z))
                }
                xArray.push(yArray)
            }
            cubesArray.push(xArray)
        }

        return cubesArray
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

let testArena = new Arena(scene)
