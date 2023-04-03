import { CUBE_SIZE, ARENA_SIZE } from "./constants"

/**
 * Changes the coordinates to match the Threejs Scene where the centre of the Arena is located at (0,0,0)
 */
export function adjustToDisplayCoordinate(coord) {
    return [
        coord[0] + CUBE_SIZE / 2 - ARENA_SIZE / 2,
        coord[1] + CUBE_SIZE / 2 - ARENA_SIZE / 2,
        coord[2] + CUBE_SIZE / 2 - ARENA_SIZE / 2
    ]
}

/**
 * Changes a list of coordinates
 */
export function adjustListToDisplayCoordinate (coords) {
    return coords.map(coord => {
        return adjustToDisplayCoordinate(coord)
    })
}