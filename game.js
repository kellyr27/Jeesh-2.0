/**
 * POSITION
 * - Defined as a 4 dimensional co-ordinate (x, y, z)
 *      - (x, y, z) being the objects location in 3D space
//  *      - (d) the direction the object is facing
//  * 
//  * DIRECTION KEY
//  * - The direction the object is facing
//  * 0 - +x (default if direction does not matter, for example STARS are directionless)
//  * 1 - -x
//  * 2 - +y
//  * 3 - -y
//  * 4 - +z
//  * 5 - -z
 */

const ARENA_SIZE = 11
const MAX_STARS = 81

/**
 * Checks if two arrays are equal
 */
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}

/**
 * Generates a random integer between 0 and MAX (not including MAX)
 */
function generateRandomInt(max) {
    return Math.floor(Math.random() * max)
}

class GameState {
    constructor () {
        this.starPositions = this.#generateStarPositions()
    }

    /**
     * Generates a list of random star positions for a random number of stars (up to MAX_STARS)
     * Stars cannot be touching the edge of the ARENA
     */
    #generateStarPositions () {
        const numStars = generateRandomInt(MAX_STARS)
        const starPositions = []

        for (let i = 0; i < numStars; i++) {
            starPositions.push([
                generateRandomInt(9)+1,
                generateRandomInt(9)+1,
                generateRandomInt(9)+1
            ])
        }

        return starPositions
    }

}

const testGameState = new GameState()
console.log(testGameState.starPositions)