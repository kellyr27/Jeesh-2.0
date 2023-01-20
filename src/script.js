import './style.css'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import GameState from './modules/game/gameState'
import SelectionPanel from './modules/display/panel'

const CUBE_SIZE = 1
const ARENA_SIZE = 11

/**
 * Checks if two arrays are equal (COPY TO REMOVE)
 */
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}

/**
 *
 */
function arrayInArray(innerArr, outerArr) {
    for (const arr of outerArr) {
        if (arrayEquals(arr, innerArr)) {
            return true
        }
    }
    return false
}

/**
     * Adds positions together and returns the sum
     */
function addCoordinates(...positions) {
    let sum = [0, 0, 0]
    for (let position of positions) {
        sum[0] += position[0]
        sum[1] += position[1]
        sum[2] += position[2]
    }
    return sum
}

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


import Arena from './modules/display/arena'
import StarsDisplay from './modules/display/stars'
import ArmyDisplay from './modules/display/army'
import UserMove from './modules/transfer/move'

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
let testArmy = new ArmyDisplay(scene, 0, [[[5, 5, 10], [1, 0, 0]], [[5, 4, 10], [1, 0, 0]]])
// let testPanel = new SelectionPanel(canvas2, [[5, 5, 10], [0, 0, -1]], [[[5, 5, 9], [0, 0, -1]], [[5, 4, 9], [0, 0, -1]]])
// let testPanel = new SelectionPanel(canvas2, [[5, 5, 10], [0, 0, -1]], [[[5, 5, 9], [0, 0, -1]], [[5, 4, 9], [0, 0, -1]]])
let testMove = new UserMove()

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
 * Update Path2D objects color
 */
// function updatePath2DColor(path2DObject, color) {
//     ctx.fillStyle = color
//     ctx.strokeStyle = 'black'
//     ctx.stroke(path2DObject)
//     ctx.fill(path2DObject)
// }

/**
 *
 */
// canvas2.addEventListener('mousemove', (evt) => {
//     evt = evt || window.event

//     // Update the Scroll tiles
//     for (let i = testPanel.scrollTiles.length - 1; i >= 0; i--) {

//         if (testPanel.scrollTiles[i] && ctx.isPointInPath(testPanel.scrollTiles[i], evt.offsetX, evt.offsetY) && !testPanel.scrollTiles[i].blocked) {
//             canvas2.style.cursor = 'pointer'
//             // updatePath2DColor(testPanel.scrollTiles[i], testPanel.tileColorPalette['scroll']['hover'])
//             userRayCaster.hoveredScrollTile = i
//             userRayCaster.hoveredSelectionTile = -1
//         } else {
//             // updatePath2DColor(testPanel.scrollTiles[i], testPanel.tileColorPalette['scroll']['default'])

//         }
//     }

//     for (let i = testPanel.selectionTiles.length - 1; i >= 0; i--) {
//         if (testPanel.selectionTiles[i] && ctx.isPointInPath(testPanel.selectionTiles[i], evt.offsetX, event.offsetY) && !testPanel.selectionTiles[i].blocked) {
//             isHoveredOverSelectionTiles = true
//             testPanel.setCurrentHoveredSquare(i)
//             canvas.style.cursor = 'pointer'
//             updatePath2DColor(testPanel.selectionTiles[i], testPanel.tileColorPalette['selection']['hover'])
//         }
//         else if (ctx.isPointInPath(testPanel.selectionTiles[i], evt.offsetX, evt.offsetY) && testPanel.selectionTiles[i].blocked) {
//             isHoveredOverSelectionTiles = true
//             testPanel.setCurrentHoveredSquare(-1)
//             canvas.style.cursor = 'default'
//             updatePath2DColor(testPanel.selectionTiles[i], testPanel.tileColorPalette['selection']['blocked'])
//         }
//         else if (testPanel.selectionTiles[i].blocked) {
//             updatePath2DColor(testPanel.selectionTiles[i], testPanel.tileColorPalette['selection']['blocked'])
//         }
//         else {
//             updatePath2DColor(testPanel.selectionTiles[i], testPanel.tileColorPalette['selection']['default'])
//         }
//     }
// })

// canvas2.addEventListener('mouseleave', (evt) => {
//     userRayCaster.hoveredScrollTile = -1
// })

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
        userRayCaster.selectedSoldier = -1
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
    console.log(`Hovered: ${userRayCaster.hoveredSoldier}\tSelected: ${userRayCaster.selectedSoldier}`)

    // Draw
    // testPanel.drawPanel()
    // console.log(userRayCaster.hoveredScrollTile + '\t' + userRayCaster.hoveredSelectionTile)

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

