export const CUBE_SIZE = 1
export const ARENA_SIZE = 11
export const ATTACK_SIZE = 3
export const MOVE_TIME_SECS = 3
export const MAX_NUM_STARS = 81
export const DOOR_COORDINATES = [[5, 5, 0], [5, 5, 10]]
export const STARTING_POSITIONS_ARMY_1 = [
    [[5, 4, 10], [0, 0, -1]], 
    [[5, 5, 10], [0, 0, -1]], 
    [[5, 6, 10], [0, 0, -1]]
]
export const STARTING_POSITIONS_ARMY_2 = [
    [[5, 4, 0], [0, 0, 1]], 
    [[5, 5, 0], [0, 0, 1]], 
    [[5, 6, 0], [0, 0, 1]],
]

export const GLOBALS = {
    MOVE_TIME_SECS: 3,
}

/**
 * Debug GUI
 */
import { ARMY_DISPLAY_COLOR_PALETTE } from './colors'
import * as dat from 'lil-gui'
const gui = new dat.GUI()
gui.add(GLOBALS, 'MOVE_TIME_SECS').min(0.1).max(5).step(0.1).name('Move Time (secs)')
gui
    .addColor(ARMY_DISPLAY_COLOR_PALETTE['0'],'default')
    .onChange(() => {
        //TO DO
        // SET COLOR
    })