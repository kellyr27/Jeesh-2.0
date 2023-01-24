import './style.css'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import GameState from './modules/game/gameState'
import SelectionPanel from './modules/display/panel'
import Arena from './modules/display/arena'
import StarsDisplay from './modules/display/stars'
import ArmyDisplay from './modules/display/army'
import Move from './modules/transfer/move'
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
const axesHelper = new THREE.AxesHelper(20);
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

/**
 * Game Variables
 */
let gameState = new GameState([[[5, 5, 10], [0, 0, -1]], [[5, 4, 10], [0, 0, -1]], [[4, 5, 10], [0, 0, -1]]], [[[5, 5, 6], [0, 0, 1]], [[5, 4, 6], [0, 0, 1]]])
gameState.removeStars()
let arena = new Arena(scene)
arena.setArena(gameState.getArmyCurrentAttackedCoordinates(0), gameState.getArmyCurrentAttackedCoordinates(1))
let starDisplay = new StarsDisplay(scene, gameState.getStars())
let armyDisplay1 = new ArmyDisplay(scene, 0, gameState.getArmyCurrentPositions(0))
let armyDisplay2 = new ArmyDisplay(scene, 1, gameState.getArmyCurrentPositions(1))
let selectionPanel = new SelectionPanel(canvas2, gameState.getSoldierCurrentPosition(0, 0), gameState.getSoldierCurrentPossibleMoves(0, 0))
let userMove = new Move()
let aiMove = new Move()
let userRaycaster = new UserRaycaster()

let aiLock = false


/**
 * Animations
 */
const clock = new THREE.Clock()

/**
 *
 */
canvas2.addEventListener('mousemove', (evt) => {
    evt = evt || window.event

    if (!userMove.getMotionLock() && !aiMove.getMotionLock()) {
        selectionPanel.resetCurrentScrollSelected()
        selectionPanel.resetCurrentSelectionSelected()

        // Update the Scroll tiles
        const scrollTiles = selectionPanel.getScrollTilePaths()
        for (let i = scrollTiles.length - 1; i >= 0; i--) {

            if (ctx.isPointInPath(scrollTiles[i], evt.offsetX, evt.offsetY)) {
                selectionPanel.setCurrentScrollHovered(i)
                selectionPanel.resetCurrentSelectionHovered()
                selectionPanel.drawPanel()
                arena.resetHovered()
                return
            }
        }

        const selectionTiles = selectionPanel.getSelectionTilePaths()
        for (let i = selectionTiles.length - 1; i >= 0; i--) {
            if (ctx.isPointInPath(selectionTiles[i], evt.offsetX, evt.offsetY)) {
                selectionPanel.setCurrentSelectionHovered(i)
                selectionPanel.resetCurrentScrollHovered()
                selectionPanel.drawPanel()
                arena.setHovered(selectionPanel.getHoveredPosition())
                return
            }
        }
    }
})

canvas2.addEventListener('click', (evt) => {
    evt = evt || window.event

    if (!userMove.getMotionLock() && !aiMove.getMotionLock()) {
        // Update the Scroll tiles
        const scrollTiles = selectionPanel.getScrollTilePaths()
        for (let i = scrollTiles.length - 1; i >= 0; i--) {

            if (ctx.isPointInPath(scrollTiles[i], evt.offsetX, evt.offsetY)) {
                selectionPanel.setCurrentScrollSelected(i)
                selectionPanel.drawPanel()
                const [startingPosition, startingDirection] = selectionPanel.getCurrentPosition()
                userMove.setStartingParameters(startingPosition, startingDirection)
                return
            }
        }

        const selectionTiles = selectionPanel.getSelectionTilePaths()
        for (let i = selectionTiles.length - 1; i >= 0; i--) {
            if (ctx.isPointInPath(selectionTiles[i], evt.offsetX, evt.offsetY)) {
                selectionPanel.setCurrentSelectionSelected(i)


                // Check if valid position
                if (selectionPanel.isValidPosition()) {
                    userMove.setMotionLock()
                    userMove.setStartingParameters(selectionPanel.getCurrentPosition(), selectionPanel.getHoveredMove())
                    // console.log(selectionPanel.getHoveredMove(), selectionPanel.getCurrentPosition())
                }
                // userMove.setStartingParameters()
                return
            }
        }
    }
})

canvas2.addEventListener('mouseleave', (evt) => {
    if (!userMove.getMotionLock() && !aiMove.getMotionLock()) {
        selectionPanel.resetCurrentScrollHovered()
        selectionPanel.drawPanel()
        canvas1.style.cursor = 'default'
    }
})

/**
 *
 */
canvas1.addEventListener('click', (evt) => {

    // If we are currently hovering over a Soldier
    if (userRaycaster.isHoveredSoldier()) {

        // And there is a previously selected Soldier, set that Soldier back to default
        if (userRaycaster.isSelectedSoldier()) {
            armyDisplay1.setDefaultColor(userRaycaster.getSelectedSoldier())
        }

        // Now set the newly Selected Soldier and color
        userRaycaster.setSelectedSoldier(userRaycaster.getHoveredSoldier())
        armyDisplay1.setSelectedColor(userRaycaster.getSelectedSoldier())
        selectionPanel.setSoldier(gameState.getSoldierCurrentPosition(0, userRaycaster.getSelectedSoldier()), gameState.getSoldierCurrentPossibleMoves(0, userRaycaster.getSelectedSoldier()))
    }

    // Check if we are not currently hovering but there is a selected Soldier
    // else if (userRaycaster.isSelectedSoldier()) {
    //     armyDisplay1.setDefaultColor(userRaycaster.getSelectedSoldier())
    //     userRaycaster.resetSelectedSoldier()
    //     selectionPanel.setSoldier(gameState.getSoldierCurrentPosition(0, 0), gameState.getSoldierCurrentPossibleMoves(0,0))
    // }
})

canvas1.addEventListener('contextmenu', (evt) => {

    if (userRaycaster.isSelectedSoldier()) {
        if (userRaycaster.getHoveredSoldier() === userRaycaster.getSelectedSoldier()) {
            armyDisplay1.setHoveredColor(userRaycaster.getSelectedSoldier())
        }
        else {
            armyDisplay1.setDefaultColor(userRaycaster.getSelectedSoldier())
        }

        userRaycaster.resetSelectedSoldier()
    }
    selectionPanel.setSoldier(gameState.getSoldierCurrentPosition(0, 0), gameState.getSoldierCurrentPossibleMoves(0, 0))
})

canvas1.addEventListener('mousemove', (evt) => {

    // Cast a raycaster and check if it intersects any of the Soldiers from Army 1
    let intersectedSoldier = raycaster.intersectObjects(armyDisplay1.getSoldiers())
    const previousIntersectedSoldierIndex = userRaycaster.getHoveredSoldier()

    // If the cursor is currently hovering over an Soldier
    if (intersectedSoldier.length !== 0) {
        const currentIntersectedSoldierIndex = intersectedSoldier[0].object.index

        // If the Soldier is being hovered over for the first time
        if (currentIntersectedSoldierIndex !== previousIntersectedSoldierIndex) {

            if ((previousIntersectedSoldierIndex !== -1) && (previousIntersectedSoldierIndex !== userRaycaster.getSelectedSoldier())) {
                armyDisplay1.setDefaultColor(previousIntersectedSoldierIndex)
            }

            if (currentIntersectedSoldierIndex !== userRaycaster.getSelectedSoldier()) {
                armyDisplay1.setHoveredColor(currentIntersectedSoldierIndex)
            }
        }

        userRaycaster.setHoveredSoldier(currentIntersectedSoldierIndex)
    }

    else {
        if ((previousIntersectedSoldierIndex !== -1) && (previousIntersectedSoldierIndex !== userRaycaster.getSelectedSoldier())) {
            armyDisplay1.setDefaultColor(previousIntersectedSoldierIndex)
        }

        userRaycaster.resetHoveredSoldier()
    }

})

const tick = () => {

    raycaster.setFromCamera(mouse, camera)

    const elapsedTime = clock.getElapsedTime()

    /**
     *
     */
    if (userMove.getMotionLock()) {

        if (userMove.getStartingFlag()) {
            selectionPanel.drawPanelBlocked()
            userMove.setStartTime(elapsedTime)
            userMove.setSoldierNum(userRaycaster.getSelectedSoldier())
            gameState.updateGameState(userMove.getSoldierNum(), userMove.getMove())
        }
        const [currentPositionX, currentPositionY, currentPositionZ] = userMove.getMovingPosition(elapsedTime)
        armyDisplay1.setSoldierPosition(userMove.getSoldierNum(), currentPositionX, currentPositionY, currentPositionZ)

        if (userMove.getTimeInMotion(elapsedTime) > MOVE_TIME_SECS) {
            arena.setArena(gameState.getArmyCurrentAttackedCoordinates(0), gameState.getArmyCurrentAttackedCoordinates(1))
            userMove.resetStartingFlag()
            userMove.resetMotionLock()
            aiLock = true
        }
    }

    if (aiLock) {
        const [AISoldierNum, AIMove] = mctsBot1(gameState)
        aiMove.setSoldierNum(AISoldierNum)
        aiMove.setStartingParameters(gameState.getSoldierCurrentPosition(1, AISoldierNum), AIMove)

        aiLock = false
        aiMove.setMotionLock()
    }

    if ((aiMove.getMotionLock()) && (elapsedTime - 10 > userMove.getStartTime())) {
        if (aiMove.getStartingFlag()) {
            aiMove.setStartTime(elapsedTime)
            gameState.updateGameState(aiMove.getSoldierNum(), aiMove.getMove())
        }

        const [currentPositionX, currentPositionY, currentPositionZ] = aiMove.getMovingPosition(elapsedTime)
        armyDisplay2.setSoldierPosition(aiMove.getSoldierNum(), currentPositionX, currentPositionY, currentPositionZ)

        if (aiMove.getTimeInMotion(elapsedTime) > MOVE_TIME_SECS) {
            arena.setArena(gameState.getArmyCurrentAttackedCoordinates(0), gameState.getArmyCurrentAttackedCoordinates(1))
            aiMove.resetStartingFlag()
            aiMove.resetMotionLock()
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()

