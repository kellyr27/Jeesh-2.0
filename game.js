/**
 * COORDINATE
 *  - Defined as an ARRAY of 3 dimensional co-ordinates [x, y, z]
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
const ATTACK_SIZE = 3

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
 * Checks if an number (num) is inbetween two digits (MIN and MAX) (not including MAX)
 */
function isNumBetween(num, min, max) {
    if ((num < min) || (num >= max)) {
        return false
    }
    else {
        return true
    }
}

/**
 * Generates a random integer between 0 and MAX (not including MAX)
 */
function generateRandomInt(max) {
    return Math.floor(Math.random() * max)
}

/**
 * Adds two arrays of the same length using matrix addition
 */
function addArrays(a, b) {
    return a.map((el, index) => {
        return el + b[index]
    })
}

class Soldier {
    constructor(startingPosition) {
        this.positions = {
            0: startingPosition
        }
        this.deathIndex = -1
    }

    /**
     * Checks whether the Soldier is alive at an given move.
     */
    isAlive(moveNum) {
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
    getPosition(moveNum) {
        const foundPositionIndex = Object.keys(this.positions).reverse().find(el => parseInt(el) <= gameIndex)
        return this.positions[foundPositionIndex]
    }

    /**
     * Sets the Soliders position at an given move.
     */
    setPosition(moveNum, position) {
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

    /**
     * Gets an array of Soldier positions at an given move.
     */
    getPositions(moveNum) {
        const positions = []

        for (const soldier of this.soldiers) {
            positions.push(soldier.getPosition(moveNum))
        }

        return positions
    }

}

class GameState {
    constructor(army1StartingPositions, army2StartingPositions) {
        this.starCoordinates = this.#generateStarCoordinates()
        this.armies = this.#generateArmies(army1StartingPositions, army2StartingPositions)
        this.currentMoveNum = 1
    }

    isCoordinateEqual(coord1, coord2) {
        return arrayEquals(coord1, coord2)
    }

    /**
     * Generates a list of random star positions for a random number of stars (up to MAX_STARS)
     * Stars cannot be touching the edge of the ARENA
     */
    #generateStarCoordinates() {
        const numStars = generateRandomInt(MAX_STARS)
        const starCoordinates = []

        for (let i = 0; i < numStars; i++) {
            starCoordinates.push([
                generateRandomInt(ARENA_SIZE - 2) + 1,
                generateRandomInt(ARENA_SIZE - 2) + 1,
                generateRandomInt(ARENA_SIZE - 2) + 1
            ])
        }

        return starCoordinates
    }

    /**
     * Generates two armies in the starting positions
     */
    #generateArmies(army1StartingPositions, army2StartingPositions) {
        return [new Army(army1StartingPositions), new Army(army2StartingPositions)]
    }

    /**
     * Gets an array of attacked coordinates
     */
    #getAttackedCoordinates(position) {
        const attackedCoordinates = []
        const [coord, direction] = position

        for (let x = coord[0] - 1 + direction[0] * ATTACK_SIZE; x <= coord[0] + 1 + direction[0] * ATTACK_SIZE; x++) {
            if (!isNumBetween(x, 0, ARENA_SIZE)) {
                continue
            }
            for (let y = coord[1] - 1 + direction[1] * ATTACK_SIZE; y <= coord[1] + 1 + direction[1] * ATTACK_SIZE; y++) {
                if (!isNumBetween(y, 0, ARENA_SIZE)) {
                    continue
                }
                for (let z = coord[2] - 1 + direction[2] * ATTACK_SIZE; z <= coord[2] + 1 + direction[2] * ATTACK_SIZE; z++) {
                    if (!isNumBetween(z, 0, ARENA_SIZE)) {
                        continue
                    }

                    attackedCoordinates.push([x, y, z])
                }
            }
        }

        return attackedCoordinates
    }



}

// const testGameState = new GameState()
// console.log(testGameState.starCoordinates)

const a = [1, 2, 5]
const b = [10, 100, 1]