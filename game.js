/**
 * COORDINATE
 *  - Defined as an ARRAY of 3 dimensional co-ordinates (x, y, z)
 * 
 * DIRECTION
 *  - Defined as an INTEGER direction the object is facing
 *  - Direction key
 *      0 - +x
 *      1 - -x
 *      2 - +y
 *      3 - -y
 *      4 - +z
 *      5 - -z
 * 
 * POSITION
 *  - Defined as an ARRAY of [COORDINATE, DIRECTION]
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

class Soldier {
    constructor (startingPosition) {
        this.positions = {
            0: startingPosition
        }
        this.deathIndex = -1
    }

    /**
     * Checks whether the Soldier is alive at an given move.
     */
    isAlive (moveNum) {
        if (this.deathIndex === -1) {
            return true
        }
        else if (this.deathIndex > moveNum) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * Gets the Soldiers position at a given move.
     * Does not check whether the Soldiers status (alive/dead) at a the given position
     */
    getPosition (moveNum) {
        const foundPositionIndex = Object.keys(this.positions).reverse().find(el => parseInt(el) <= gameIndex)
        return this.positions[foundPositionIndex]
    }

    /**
     * Sets the Soliders position at an given move.
     */
    setPosition (moveNum, position) {
        this.positions[moveNum] = position
    }

}

class Army {
    constructor(startingPositions) {
        this.soldiers = this.#generateSoldiers(startingPositions)
    }

    /**
     * Generates a list of Soldiers at each of the starting positions
     */
    #generateSoldiers(startingPositions) {
        const soldiers = []

        for (const position of startingPositions) {
            soldiers.push(new Soldier(position))
        }

        return soldiers
    }

    /**
     * Gets the number of Soldiers alive at a given move.
     */
    getAliveCount(moveNum) {
        return this.soldiers.filter(soldier => soldier.isAlive(moveNum)).length
    }
}

class GameState {
    constructor () {
        this.starCoordinates = this.#generateStarCoordinates()
        this.currentMoveNum = 1
    }

    /**
     * Generates a list of random star positions for a random number of stars (up to MAX_STARS)
     * Stars cannot be touching the edge of the ARENA
     */
    #generateStarCoordinates () {
        const numStars = generateRandomInt(MAX_STARS)
        const starCoordinates = []

        for (let i = 0; i < numStars; i++) {
            starCoordinates.push([
                generateRandomInt(9)+1,
                generateRandomInt(9)+1,
                generateRandomInt(9)+1
            ])
        }

        return starCoordinates
    }

}

const testGameState = new GameState()
console.log(testGameState.starCoordinates)