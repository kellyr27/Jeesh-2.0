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