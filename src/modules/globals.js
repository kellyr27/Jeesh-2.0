/**
 * Constants for the game
 */
export const CUBE_SIZE = 1
export const ARENA_SIZE = 11
export const ATTACK_SIZE = 3
export const MOVE_TIME_SECS = 3
export const MAX_NUM_STARS = 81

/**
 * Checks if two arrays are equal
 */
export function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}

/**
 * Checks if an array is contained in an Array of arrays.
 */
export function arrayInArray(checkArr, arrOfArrs) {
    for (const arr of arrOfArrs) {
        if (arrayEquals(arr, checkArr)) {
            return true
        }
    }
    return false
}

/**
 * Adds arrays together and returns the sum
 */
export function addArrays(a, b) {
    
    if (!arrayEquals) {
        return console.error(`Array ${a} and Array ${b} are of different length. They cannot be added.`)
    }

    return a.map((el, index) => {
        return el + b[index]
    })
}

/**
 * Checks if an number is between two digits [MIN, MAX)
 */
export function isNumBetween(num, min, max) {
    if ((num < min) || (num >= max)) {
        return false
    }
    else {
        return true
    }
}

/**
 * Generates a random integer between 0 and MAX [0, MAX)
 */
export function generateRandomInt(max) {
    return Math.floor(Math.random() * max)
}