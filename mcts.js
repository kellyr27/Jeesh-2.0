/**
 * A State of Jeesh is defined as an Array of length 3, each containing an Object representing each army.
 * The object contains the current positions of each soldier and an counter for how many times this 
 * 
 * State = {
 *      armyToMove - int (0 or 1), current army index to move
 *      armyPositions - array of length 2, cotaining an array of positions for the given army
 *      starCoordinates - list of star coordinates
 * }
 * 
 * Action = {
 *      soldierNum - the index of the Soldier to move
 *      position - the new position that the Soldier will move too
 * }
 * 
 * For the purposes of the Monte Carlo Tree Search, we will ignore the draw by Threefold Repetition to speed up the algorithm.
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
 * Checks if an array in contained in an outer array
 */
function isArrContainedInArray(innerArr, outerArr) {
    for (const el of outerArr) {
        if (arrayEquals(innerArr, el)) {
            return true
        }
    }
    return false
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
 * Get a list of coordinates from a list of Positions
 */
function positionsToCoordinates(positions) {
    return positions.map((el) => {
        return el[0]
    })
}

/**
 * Get a list of all possible actions from a single Soldier position
 */
function getSoldierActions(soldierNum, state) {
    const soldierPossibleActions = []

    const [coord, direction] = this.state.armyPositions[this.state.armyToMove][soldierNum]

    for (let x = coord[0] - 1; x <= coord[0] + 1; x++) {
        if (!isNumBetween(x, 0, ARENA_SIZE)) {
            continue
        }
        for (let y = coord[1] - 1; y <= coord[1] + 1; y++) {
            if (!isNumBetween(y, 0, ARENA_SIZE)) {
                continue
            }
            for (let z = coord[2] - 1; z <= coord[2] + 1; z++) {
                if (!isNumBetween(z, 0, ARENA_SIZE)) {
                    continue
                }

                // Remove the coordinate that the soldier currently occupies
                if ((x == 0) && (y == 0) && (z == 0)) {
                    continue
                }

                // Filter out coordinates occupied by a Soldier or Star
                if (isArrContainedInArray([x, y, z], this.starCoordinates)) {
                    continue
                }
                if ((isArrContainedInArray([x, y, z], positionsToCoordinates(state.armyPositions[0])))) {
                    continue
                }
                if ((isArrContainedInArray([x, y, z], positionsToCoordinates(state.armyPositions[1])))) {
                    continue
                }

                // Facing the +x direction
                if (x == coord[0] + 1) {
                    soldierPossibleActions.push([[x, y, z], [1, 0, 0]])
                }

                // Facing the -x direction
                if (x == coord[0] - 1) {
                    soldierPossibleActions.push([[x, y, z], [-1, 0, 0]])
                }

                // Facing the +y direction
                if (y == coord[1] + 1) {
                    soldierPossibleActions.push([[x, y, z], [0, 1, 0]])
                }

                // Facing the -y direction
                if (y == coord[1] - 1) {
                    soldierPossibleActions.push([[x, y, z], [0, -1, 0]])
                }

                // Facing the +z direction
                if (z == coord[2] + 1) {
                    soldierPossibleActions.push([[x, y, z], [0, 0, 1]])
                }

                // Facing the -z direction
                if (z == coord[2] - 1) {
                    soldierPossibleActions.push([[x, y, z], [0, 0, -1]])
                }
            }
        }
    }

    return soldierPossibleActions
}

/**
 * Get a list of all possible actions from a given state
 */
function getActions(state) {
    let possibleActions = []

    for (let i = 0; i < state.armyPositions[armyToMove].length; i++) {
        const possibleSoldierActions = getSoldierActions(i, state).map((el) => {
            return {
                soldierIndex: i,
                position: el
            }
        })

        possibleActions = [...possibleActions, ...possibleSoldierActions]
    }

    return possibleActions
}

/**
 * Returns the next state after an given action is applied
 */
function getNextState (state, action) {
    let stateCopy = JSON.parse(JSON.stringify(state))
    return stateCopy
}

let state1 = {
    a: 1,
    b: [[[1,1,1],[0,0,1]], [[1,1,1],[0,0,1]]]
}

let state2 = getNextState (state1)

console.log(state2)

state1.a = 100
state2.b[1][0][0] = 10

console.log(state1.b[1][0][0])
console.log(state2.b[1][0][0])
console.log(state1.a)
console.log(state2.a)