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
import { ARENA_SIZE, arrayEquals, MOVE_TIME_SECS } from './modules/globals'
import { mctsBot1 } from './modules/ai/mcts'

/**
 * Canvas for Arena
 */
const canvas1 = document.querySelector('canvas.webgl')
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
        canvas1.requestFullscreen()
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
const controls = new TrackballControls(camera, canvas1)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas1
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

let game = new GameState([[[5,5,10],[0,0,-1]],[[5,4,10],[0,0,-1]],[[4,5,10],[0,0,-1]]],[[[5,5,6],[0,0,1]],[[5,4,6],[0,0,1]]])
let testArena = new Arena(scene)
testArena.setArena(game.getArmyCurrentAttackedCoordinates(0), game.getArmyCurrentAttackedCoordinates(1))
let stars = new StarsDisplay(scene, game.getStars())
let testArmy = new ArmyDisplay(scene, 0, game.getArmyCurrentPositions(0))
let testOppArmy = new ArmyDisplay(scene, 1, game.getArmyCurrentPositions(1))
let testPanel = new SelectionPanel(canvas2, game.getSoldierCurrentPosition(0,0), game.getSoldierCurrentPossibleMoves(0,0))
let testMove = new UserMove()
let testRaycaster = new UserRaycaster()

/**
 * Animations
 */
const clock = new THREE.Clock()
let inMotionLock = false
let aiLock = false

/**
 *
 */
canvas2.addEventListener('mousemove', (evt) => {
    evt = evt || window.event

    testPanel.resetCurrentScrollSelected()
    testPanel.resetCurrentSelectionSelected()

    // Update the Scroll tiles
    const scrollTiles = testPanel.getScrollTilePaths()
    for (let i = scrollTiles.length - 1; i >= 0; i--) {

        if (ctx.isPointInPath(scrollTiles[i], evt.offsetX, evt.offsetY)) {
            testPanel.setCurrentScrollHovered(i)
            testPanel.resetCurrentSelectionHovered()
            testPanel.drawPanel()
            testArena.resetHovered()
            return
        }
    }

    const selectionTiles = testPanel.getSelectionTilePaths()
    for (let i = selectionTiles.length - 1; i >= 0; i--) {
        if (ctx.isPointInPath(selectionTiles[i], evt.offsetX, evt.offsetY)) {
            testPanel.setCurrentSelectionHovered(i)
            testPanel.resetCurrentScrollHovered()
            testPanel.drawPanel()
            testArena.setHovered(testPanel.getHoveredPosition())
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
            testPanel.drawPanel()
            const [startingPosition, startingDirection] = testPanel.getCurrentPosition()
            testMove.setStartingParameters(startingPosition, startingDirection)
            return
        }
    }

    const selectionTiles = testPanel.getSelectionTilePaths()
    for (let i = selectionTiles.length - 1; i >= 0; i--) {
        if (ctx.isPointInPath(selectionTiles[i], evt.offsetX, evt.offsetY)) {
            testPanel.setCurrentSelectionSelected(i)

    
            // Check if valid position
            if (testPanel.isValidPosition()) {
                inMotionLock = true
                testMove.setStartingParameters(testPanel.getCurrentPosition(), testPanel.getHoveredMove())
                // console.log(testPanel.getHoveredMove(), testPanel.getCurrentPosition())
            }
            // testMove.setStartingParameters()
            return
        }
    }
})

canvas2.addEventListener('mouseleave', (evt) => {
    // userRayCaster.hoveredScrollTile = -1
    testPanel.resetCurrentScrollHovered()
    canvas1.style.cursor = 'default'
})

/**
 *
 */
canvas1.addEventListener('click', (evt) => {

    // If we are currently hovering over a Soldier
    if (testRaycaster.isHoveredSoldier()) {

        // And there is a previously selected Soldier, set that Soldier back to default
        if (testRaycaster.isSelectedSoldier()) {
            testArmy.setDefaultColor(testRaycaster.getSelectedSoldier())
        }

        // Now set the newly Selected Soldier and color
        testRaycaster.setSelectedSoldier(testRaycaster.getHoveredSoldier())
        testArmy.setSelectedColor(testRaycaster.getSelectedSoldier())
        testPanel.setSoldier(game.getSoldierCurrentPosition(0, testRaycaster.getSelectedSoldier()), game.getSoldierCurrentPossibleMoves(0,testRaycaster.getSelectedSoldier()))
    }

    // Check if we are not currently hovering but there is a selected Soldier
    // else if (testRaycaster.isSelectedSoldier()) {
    //     testArmy.setDefaultColor(testRaycaster.getSelectedSoldier())
    //     testRaycaster.resetSelectedSoldier()
    //     testPanel.setSoldier(game.getSoldierCurrentPosition(0, 0), game.getSoldierCurrentPossibleMoves(0,0))
    // }
})

canvas1.addEventListener('contextmenu', (evt) => {

    if (testRaycaster.isSelectedSoldier()) {
        if (testRaycaster.getHoveredSoldier() === testRaycaster.getSelectedSoldier()) {
            testArmy.setHoveredColor(testRaycaster.getSelectedSoldier())
        }
        else {
            testArmy.setDefaultColor(testRaycaster.getSelectedSoldier())
        }

        testRaycaster.resetSelectedSoldier()
    }
    testPanel.setSoldier(game.getSoldierCurrentPosition(0, 0), game.getSoldierCurrentPossibleMoves(0,0))
})

canvas1.addEventListener('mousemove', (evt) => {

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

})

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // Draw
    // testPanel.drawPanel()

    /**
     *
     */
    raycaster.setFromCamera(mouse, camera)


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
    if (inMotionLock) {

        if (testMove.getStartingFlag()) {
            testMove.setStartTime(elapsedTime)
            testMove.setSoldierNum(testRaycaster.getSelectedSoldier())
            game.updateGameState(testMove.getSoldierNum(), testMove.getMove())
        }
        const [currentPositionX, currentPositionY, currentPositionZ] = testMove.getMovingPosition(elapsedTime)
        testArmy.setSoldierPosition(testMove.getSoldierNum(), currentPositionX, currentPositionY, currentPositionZ)

        if (testMove.getTimeInMotion(elapsedTime) > MOVE_TIME_SECS) {
            
            inMotionLock = false
            testMove.resetStartingFlag()
            aiLock = true
        }
    }

    if (aiLock) {
        console.log(mctsBot1(game))
        aiLock = false
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()

