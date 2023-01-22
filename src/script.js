import './style.css'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import GameState from './modules/game/gameState'
import SelectionPanel from './modules/display/panel'
import Arena from './modules/display/arena'
import StarsDisplay from './modules/display/stars'
import ArmyDisplay from './modules/display/army'
import UserMove from './modules/transfer/move'
import UserRaycaster from './modules/transfer/raycaster'
import { ARENA_SIZE, MOVE_TIME_SECS } from './modules/globals'

/**
 * Canvas for Arena
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

/**
 * Cavas for Selection Panel
 */
const canvas2 = document.getElementById('panel')
const ctx = canvas2.getContext('2d')

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

/**
 * Double click to expand to full screen
 * NOTE: Does not work on Safari browser
 */
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
let testArmy = new ArmyDisplay(scene, 0, [[[5, 5, 10], [1, 0, 0]], [[5, 4, 10], [1, 0, 0]]])
// let testPanel = new SelectionPanel(canvas2, [[5, 5, 10], [0, 0, -1]], [[[5, 5, 9], [0, 0, -1]], [[5, 4, 9], [0, 0, -1]]])
let testPanel = new SelectionPanel(canvas2, [[5, 5, 10], [0, 0, -1]], [[[5, 5, 9], [0, 0, -1]], [[5, 4, 9], [0, 0, -1]]])
let testMove = new UserMove()
let testRaycaster = new UserRaycaster()

/**
 * Animations
 */
const clock = new THREE.Clock()
const MOVE_TIME = 3
let mouseStart = false
let inMotion = false
let userRayCaster = {
    hoveredSoldier: -1,
    selectedSoldier: -1,
    // hoveredSelectionTile: -1,
    // selectedSelectionTile: -1,
    // hoveredScrollTile: -1,
    // selectedScrollTile: -1
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

/**
 *
 */
canvas2.addEventListener('mousemove', (evt) => {
    evt = evt || window.event

    // Update the Scroll tiles
    const scrollTiles = testPanel.getScrollTilePaths()
    for (let i = scrollTiles.length - 1; i >= 0; i--) {

        if (ctx.isPointInPath(scrollTiles[i], evt.offsetX, evt.offsetY)) {
            testPanel.setCurrentScrollHovered(i)
            testPanel.resetCurrentSelectionHovered()
            return
        }
    }

    const selectionTiles = testPanel.getSelectionTilePaths()
    for (let i = selectionTiles.length - 1; i >= 0; i--) {
        if (ctx.isPointInPath(selectionTiles[i], evt.offsetX, evt.offsetY)) {
            testPanel.setCurrentSelectionHovered(i)
            testPanel.resetCurrentScrollHovered()
            return
        }
    }
})

canvas2.addEventListener('click', (evt) => {
    evt = evt || window.event

    // Update the Scroll tiles
    const scrollTiles = testPanel.getScrollTilePaths()
    for (let i = scrollTiles.length - 1; i >= 0; i--) {

        if (ctx.isPointInPath(scrollTiles[i], evt.offsetX, evt.offsetY)) {
            testPanel.setCurrentScrollSelected(i)
            return
        }
    }

    const selectionTiles = testPanel.getSelectionTilePaths()
    for (let i = selectionTiles.length - 1; i >= 0; i--) {
        if (ctx.isPointInPath(selectionTiles[i], evt.offsetX, evt.offsetY)) {
            testPanel.setCurrentSelectionSelected(i)
            return
        }
    }
})

canvas2.addEventListener('mouseleave', (evt) => {
    // userRayCaster.hoveredScrollTile = -1
    testPanel.resetCurrentScrollHovered()
    canvas.style.cursor = 'default'
})

/**
 *
 */
canvas.addEventListener('click', (evt) => {
    // if (userRayCaster.hoveredSoldier !== -1) {
    //     if (userRayCaster.selectedSoldier !== -1) {
    //         testArmy.setDefaultColor(userRayCaster.selectedSoldier)
    //     }
    //     userRayCaster.selectedSoldier = userRayCaster.hoveredSoldier
    //     testArmy.setSelectedColor(userRayCaster.selectedSoldier)
    // }
    // else if (userRayCaster.selectedSoldier !== -1) {
    //     testArmy.setDefaultColor(userRayCaster.selectedSoldier)
    //     userRayCaster.selectedSoldier = -1
    // }

    if (testRaycaster.isHoveredSoldier()) {
        if (testRaycaster.isSelectedSoldier()) {
            testArmy.setDefaultColor(testRaycaster.getSelectedSoldier())
        }
        testRaycaster.setSelectedSoldier(testRaycaster.getHoveredSoldier())
        testArmy.setSelectedColor(testRaycaster.getSelectedSoldier())
    }
    else if (testRaycaster.isSelectedSoldier()) {
        testArmy.setDefaultColor(testRaycaster.getSelectedSoldier())
        testRaycaster.resetSelectedSoldier()
    }
})

canvas.addEventListener('contextmenu', (evt) => {

    if (testRaycaster.isSelectedSoldier()) {
        if (testRaycaster.getHoveredSoldier() === testRaycaster.getSelectedSoldier()) {
            testArmy.setHoveredColor(testRaycaster.getSelectedSoldier())
        }
        else {
            testArmy.setDefaultColor(testRaycaster.getSelectedSoldier())
        }

        testRaycaster.resetSelectedSoldier()
    }
})

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // Draw
    // testPanel.drawPanel()

    /**
     *
     */
    raycaster.setFromCamera(mouse, camera)
    
    /**
     * Updates the UserMove parameters
     */
    if (!inMotion) {

        // Cast a raycaster and check if it intersects any of the Soldiers from Army 1
        let intersectedSoldier = raycaster.intersectObjects(testArmy.getSoldiers())
        const previousIntersectedSoldierIndex = testRaycaster.getHoveredSoldier()

        // If the cursor is currently hovering over an Soldier
        if (intersectedSoldier.length !== 0) {
            const currentIntersectedSoldierIndex = intersectedSoldier[0].object.index

            // If the Soldier is being hovered over for the first time
            if (currentIntersectedSoldierIndex !== previousIntersectedSoldierIndex) {

                if ((previousIntersectedSoldierIndex !== -1) && (previousIntersectedSoldierIndex !== testRaycaster.getSelectedSoldier())) {
                    testArmy.setDefaultColor(previousIntersectedSoldierIndex)
                }

                if (currentIntersectedSoldierIndex !== testRaycaster.getSelectedSoldier()) {
                    testArmy.setHoveredColor(currentIntersectedSoldierIndex)
                }
            }

            testRaycaster.setHoveredSoldier(currentIntersectedSoldierIndex)
        }

        else {
            if ((previousIntersectedSoldierIndex !== -1) && (previousIntersectedSoldierIndex !== testRaycaster.getSelectedSoldier())) {
                testArmy.setDefaultColor(previousIntersectedSoldierIndex)
            }

            testRaycaster.resetHoveredSoldier()
        }
    }

    // Check whether motion time has finished
    // if (inMotion) {

    //     if (userMove.getStartingFlag()) {

    //         const [xPosition, yPosition, zPosition] = testArmy.getSoldierPosition(userMove.soldierNum)
    //         const [xRotation, yRotation, zRotation] = testArmy.getSoldierRotation(userMove.soldierNum)

    //         userMove.setStartingParameters(elapsedTime, xPosition, yPosition, zPosition, xRotation, yRotation, zRotation)
    //     }

    //     const elapsedTimeInMotion = elapsedTime - userMove.startTime

    //     testArmy.updateSoldierPosition(
    //         userMove.soldierNum,
    //         userMove.startXPosition + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishX - userMove.startX),
    //         userMove.startYPosition + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishY - userMove.startY),
    //         userMove.startZPosition + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishZ - userMove.startZ)
    //     )

    //     testArmy.updateSoldierRotation(
    //         userMove.soldierNum,
    //         userMove.startXRotation + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishXRotation - userMove.startXRotation),
    //         userMove.startYRotation + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishYRotation - userMove.startYRotation),
    //         userMove.startZRotation + (elapsedTimeInMotion / MOVE_TIME) * (userMove.finishZRotation - userMove.startZRotation)
    //     )

    //     if (elapsedTimeInMotion >= MOVE_TIME) {
    //         inMotion = false
    //     }
    // }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()

