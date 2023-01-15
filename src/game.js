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
        if (startingPosition !== undefined) {
            this.positions = {
                0: startingPosition
            }
            this.deathIndex = -1
        }
    }

    clone(existingSoldier) {
        this.positions = structuredClone(existingSoldier.positions)
        this.deathIndex = structuredClone(existingSoldier.deathIndex)
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
     * Sets the move number at which the Soldier died.
     */
    setDeath(moveNum) {
        this.deathIndex = moveNum
    }

    /**
     * Gets the Soldiers position at a given move.
     * Does not check whether the Soldiers status (alive/dead) at a the given position
     */
    getPosition(moveNum) {
        const foundPositionIndex = Object.keys(this.positions).reverse().find(el => parseInt(el) <= moveNum)
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
        if (startingPositions !== undefined) {
            this.soldiers = this.#generateSoldiers(startingPositions)
        }
    }

    clone(existingArmy) {
        this.soldiers = []

        for (const soldier of existingArmy.soldiers) {
            const newSoldier = new Soldier()
            newSoldier.clone(soldier)
            this.soldiers.push(newSoldier)
        }

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
     * Gets an array of Soldier coordinates at an given move.
     */
    getCoordinates(moveNum) {
        const positions = []

        for (const soldier of this.soldiers) {
            if (soldier.isAlive(moveNum)) {
                positions.push(soldier.getPosition(moveNum)[0])
            }
        }

        return positions
    }

}

class GameState {
    constructor(army1StartingPositions, army2StartingPositions) {
        if (army2StartingPositions !== undefined) {
            this.starCoordinates = this.#generateStarCoordinates()
            this.armies = this.#generateArmies(army1StartingPositions, army2StartingPositions)
            this.currentMoveNum = 1
            this.currentArmyNum = 0
            this.gameStatus = [-1, -1]
        }
    }

    getCurrentArmy() {
        return this.currentArmyNum
    }

    clone(existingGameState) {
        this.starCoordinates = structuredClone(existingGameState.starCoordinates)
        this.currentMoveNum = structuredClone(existingGameState.currentMoveNum)
        this.currentArmyNum = structuredClone(existingGameState.currentArmyNum)
        this.gameStatus = structuredClone(existingGameState.gameStatus)

        this.armies = [new Army(), new Army()]
        this.armies[0].clone(existingGameState.armies[0])
        this.armies[1].clone(existingGameState.armies[1])
    }

    #isCoordinateEqual(coord1, coord2) {
        return arrayEquals(coord1, coord2)
    }

    #isCoordinateInArray(coord, arr) {
        for (const coordInArr of arr) {
            if (this.#isCoordinateEqual(coord, coordInArr)) {
                return true
            }
        }
        return false
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

        for (let x = coord[0] - 1 + direction[0] * 2; x <= coord[0] + 1 + direction[0] * 2; x++) {
            if (!isNumBetween(x, 0, ARENA_SIZE)) {
                continue
            }
            for (let y = coord[1] - 1 + direction[1] * 2; y <= coord[1] + 1 + direction[1] * 2; y++) {
                if (!isNumBetween(y, 0, ARENA_SIZE)) {
                    continue
                }
                for (let z = coord[2] - 1 + direction[2] * 2; z <= coord[2] + 1 + direction[2] * 2; z++) {
                    if (!isNumBetween(z, 0, ARENA_SIZE)) {
                        continue
                    }

                    attackedCoordinates.push([x, y, z])
                }
            }
        }

        return attackedCoordinates
    }

    /**
     * Returns a list of attacked coordinates for an given army at an given move
     */
    getArmyAttackedCoordinates(moveNum, armyNum) {
        let armyAttackedCoordinates = []
        for (const soldier of this.armies[armyNum].soldiers) {
            if (soldier.isAlive(moveNum)) {
                armyAttackedCoordinates = [...armyAttackedCoordinates, ...this.#getAttackedCoordinates(soldier.getPosition(moveNum))]
            }
        }

        return armyAttackedCoordinates
    }

    /**
     * Get current Armies possible moves
     */
    getCurrentArmyPossibleActions() {
        return this.#getArmyPossibleActions(this.currentMoveNum, this.currentArmyNum)
    }


    /**
     * Returns a list of possible moves for an given Army at an given move
     */
    #getArmyPossibleActions(moveNum, armyNum) {
        let armyPossibleActions = []


        for (let i = 0; i < this.armies[armyNum].soldiers.length; i++) {

            for (const possibleAction of this.getSoldierPossibleActions(moveNum, armyNum, i)) {
                armyPossibleActions.push([i, possibleAction])
            }
        }

        return armyPossibleActions
    }

    /**
     * Returns a list of possible moves for an given soldier for an given army at an given move
     */
    getSoldierPossibleActions(moveNum, armyNum, soldierNum) {

        const soldierPossibleActions = []

        const [coord, direction] = this.armies[armyNum].soldiers[soldierNum].getPosition(moveNum)


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
                    if (this.#isCoordinateInArray([x, y, z], this.starCoordinates)) {
                        continue
                    }
                    if ((this.#isCoordinateInArray([x, y, z], this.armies[0].getCoordinates(moveNum)))) {
                        continue
                    }
                    if ((this.#isCoordinateInArray([x, y, z], this.armies[1].getCoordinates(moveNum)))) {
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
     * Checks whether on a certain move if the game position has been repeated three times.
     */
    #checkDrawByRepetition (moveNum) {
        return false
    }

    /**
     * Checks whether on a certain move if both Armies have no soldiers remaining, the game is automatically a draw by default.
     */
    #checkDrawByDefault (moveNum) {
        if ((this.armies[0].getAliveCount() == 0) && (this.armies[1].getAliveCount(moveNum) == 0)) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * 
     */
    #checkDrawByMaxMoves (moveNum) {
        if (moveNum === 500) {
            return true
        }
        else {
            return false
        }
    }

    #checkWinByCapture(moveNum, armyNum) {

        if (armyNum == 0) {
            for (const soldier of this.armies[0].soldiers) {
                if (this.#isCoordinateEqual(soldier.getPosition(moveNum)[0], [5, 5, 0])) {
                    return true
                }
            }
        }
        else if (armyNum == 1) {
            for (const soldier of this.armies[1].soldiers) {
                if (this.#isCoordinateEqual(soldier.getPosition(moveNum)[0], [5, 5, 10])) {
                    return true
                }
            }
        }
        else {
            return false
        }
    }

    /**
     * Checks whether on a certain move if one army has no remaining soldiers, the other wins by default.
     */
    #checkWinByDefault(moveNum, armyNum) {
        if ((this.armies[armyNum].getAliveCount() != 0) && (this.armies[this.#opposingArmyNum(armyNum)].getAliveCount(moveNum) == 0)) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * 
     */
    #opposingArmyNum(armyNum) {
        return ((armyNum == 0) ? 1 : 0)
    }

    /**
     * 
     */
    updateGameState(soldierNum, position) {

        if (this.gameStatus[0] !== -1) {
            console.error('Cannot execute move. Game is over!')
            return
        }

        this.playMove(this.currentMoveNum, this.currentArmyNum, soldierNum, position)
        this.updateArmies(this.currentMoveNum, this.currentArmyNum, soldierNum, position)
        this.updateGameStatus(this.currentMoveNum, this.currentArmyNum)

        this.currentArmyNum = this.#opposingArmyNum(this.currentArmyNum)
        this.currentMoveNum += 1

        // if (this.gameStatus[0] == 0) {
        //     if (this.gameStatus[1] == 0) {
        //         console.log('Army 1 wins by Default!')
        //         return
        //     }
        //     if (this.gameStatus[1] == 1) {
        //         console.log('Army 1 wins by Capture!')
        //         return
        //     }
        // }
        // else if (this.gameStatus[0] == 1) {
        //     if (this.gameStatus[1] == 0) {
        //         console.log('Army 2 wins by Default!')
        //         return
        //     }
        //     if (this.gameStatus[1] == 1) {
        //         console.log('Army 2 wins by Capture!')
        //         return
        //     }
        // }
        // else if (this.gameStatus[0] == 2) {
        //     if (this.gameStatus[1] == 0) {
        //         console.log('Draw by Default!')
        //         return
        //     }
        //     if (this.gameStatus[1] == 1) {
        //         console.log('Draw by Repetition!')
        //         return
        //     }
        // }
    }

    /**
     * 
     */
    isGameOver() {
        if (this.gameStatus[0] !== -1) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * 
     */
    getResult() {
        if (this.gameStatus[0] === -1) {
            console.error('Requesting the result and the game has not finished!')
        }
        else {
            return this.gameStatus[0]
        }
    }

    /**
     * 
     */
    playMove(moveNum, armyNum, soldierNum, position) {
        this.armies[armyNum].soldiers[soldierNum].setPosition(moveNum, position)
    }

    /**
     * Updates all soldiers alive/dead status when a given move has been played
     */
    updateArmies(moveNum, armyNum, soldierNum, position) {

        // Check whether the Soldier has moved into the opposing Armies attacked Zone
        if (this.#isCoordinateInArray(position[0], this.getArmyAttackedCoordinates(moveNum, this.#opposingArmyNum()))) {
            this.armies[armyNum].soldiers[soldierNum].setDeath(moveNum)
        }

        // Check whether any opposing Soldier is in the new attacked Zone
        const newAttackedZone = this.#getAttackedCoordinates(position)
        for (const soldier of this.armies[this.#opposingArmyNum(armyNum)].soldiers) {
            if (this.#isCoordinateInArray(soldier.getPosition(moveNum)[0], newAttackedZone)) {
                soldier.setDeath(moveNum)
            }
        }
    }

    /**
     * Update the game Status
     */

    /**
     * Game Status is a 2D array of length 2
     * First number represents the status of the game by the following codes
     *      -1 - Game still in progress (default)
     *       0 - Win by Army 1
     *       1 - Win by Army 2
     *       2 - Draw
     * Second number represents the method for which the game has ended by the following codes.
     *      -1 - NA (default)
     *      For Draw
     *           0 - By Default (both teams insuffient material)
     *           1 - By Threefold Repetition (position has repeated three times with the same Army to move)
     *           2 - By Maximum Number of Moves (set to 500)
     *      For Win by Army 1 or Army 2
     *           0 - By Default (only one Army has no Soldiers alive)
     *           1 - By Capture (one Army has entered the opposing Armies door coordinate)
     */
    updateGameStatus(moveNum, armyNum) {
        if (this.#checkDrawByDefault(moveNum)) {
            this.gameStatus = [2, 0]
            return
        }
        else if (this.#checkDrawByMaxMoves(moveNum)) {
            this.gameStatus = [2,2]
        }
        else if (this.#checkDrawByRepetition(moveNum)) {
            this.gameStatus = [2, 1]
            return
        }
        else if (this.#checkWinByDefault(moveNum, armyNum)) {
            this.gameStatus = [armyNum, 0]
            return
        }
        else if (this.#checkWinByCapture(moveNum, armyNum)) {
            this.gameStatus = [armyNum, 1]
            return
        }

    }

    /**
     * DESIGNED FOR TESTING PURPOSES
     * Prints the state of the Arena in the command line
     */
    printArena() {
        const army1Coordinates = this.armies[0].getCoordinates(this.currentMoveNum)
        const army2Coordinates = this.armies[1].getCoordinates(this.currentMoveNum)

        const army1AttackedCoordinates = this.getArmyAttackedCoordinates(this.currentMoveNum, 0)
        const army2AttackedCoordinates = this.getArmyAttackedCoordinates(this.currentMoveNum, 1)

        /**
         * X - Army 1 Positions
         * O - Army 2 Positions
         * + - Attacked Cubes by Army 1
         * - - Attacked Cubes by Army 2
         * / - Attacked Cubes by both Army 1 & 2
         * * - Star Positions
         */

        for (let z = ARENA_SIZE - 1; z >= 0; z--) {
            console.log(`------------------------- Z=${z}`)
            for (let y = ARENA_SIZE - 1; y >= 0; y--) {
                let printString = '| '
                for (let x = 0; x < ARENA_SIZE; x++) {

                    const isInArmy1AttackedCubes = this.#isCoordinateInArray([x, y, z], army1AttackedCoordinates)
                    const isInArmy2AttackedCubes = this.#isCoordinateInArray([x, y, z], army2AttackedCoordinates)

                    if (this.#isCoordinateInArray([x, y, z], this.starCoordinates)) {
                        printString += '*'
                    }
                    else if (this.#isCoordinateInArray([x, y, z], army1Coordinates)) {
                        printString += 'X'
                    }
                    else if (this.#isCoordinateInArray([x, y, z], army2Coordinates)) {
                        printString += 'O'
                    }

                    // Check if Cube attacked by both Armies
                    else if (isInArmy1AttackedCubes && isInArmy2AttackedCubes) {
                        printString += '/'
                    }
                    else if (isInArmy1AttackedCubes) {
                        printString += '+'
                    }
                    else if (isInArmy2AttackedCubes) {
                        printString += '-'
                    }
                    // No spacing on last column
                    else {
                        printString += ' '
                    }
                    printString += ' '
                }
                console.log(printString + '|')
            }
        }
    }
}

/**
 * Get Possible Actions
 */
function jeeshGetPossibleActions(state) {
    return state.getCurrentArmyPossibleActions()
}

function jeeshGetNextState(state, action) {
    // Create a clone state for next state to return
    const nextState = new GameState()
    nextState.clone(state)
    const [soldierNumToMove, positionSelected] = action
    nextState.updateGameState(soldierNumToMove, positionSelected)

    return nextState
}

/**
 * Simulates a game of Jeesh from a given State and returns the Gain depending on which Army we which to maximize
 */
function jeeshSimulateGame(state) {
    const simulationState = new GameState()
    simulationState.clone(state)

    // Simulate a game
    while (!simulationState.isGameOver()) {
        const possibleActions = simulationState.getCurrentArmyPossibleActions()
        const [soldierNumToMove, actionSelected] = selectRandomAction(possibleActions)
        simulationState.updateGameState(soldierNumToMove, actionSelected)
    }

    return simulationState
}

function jeeshGetGain(state, rootState) {
    const result = state.getResult()

    if (result === 2) {
        return 0.5
    }
    // Game ended in win for Army 1
    else if (result === 0) {
        if (rootState.getCurrentArmy() === 0) {
            return 1
        }
        else {
            return 0
        }
    }
    // Game ended in win for Army 2
    else if (result === 1) {
        if (rootState.getCurrentArmy() === 0) {
            return 0
        }
        else {
            return 1
        }
    }
    else {
        console.error('Game has not finished to get Gain!')
    }
}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

class Node {

    constructor(state, action) {

        // Action taken on the previous state
        this.action = action
        this.state = state
        this.children = []

        // For calculating the UCB Score
        this.n = 0
        this.s = 0
    }

    // Checks if the Node is a leaf node (no children)
    isLeaf() {
        return (this.children.length == 0)
    }

    // Create list of children from list of possible actions
    createChildren(getPossibleActions, getNextState, maxNumActions) {

        let possibleActions = getPossibleActions(this.state)

        // Select only a predefined number of possible actions to save memory
        if (possibleActions.length > maxNumActions) {
            possibleActions = getRandomSubarray(possibleActions, maxNumActions)
        }

        for (const action of possibleActions) {
            this.children.push(new Node(getNextState(this.state, action), action))
        }

    }

    /**
     * Selects a random child for the Expansion Phase
     */
    selectedRandomChild() {
        const randomChildIndex = generateRandomInt(this.children.length)
        return this.children[randomChildIndex]
    }

    /**
     * Select Child with the highest UCB score
     */
    getChildren() {
        return this.children
    }

    getNumOfVisits() {
        return this.n
    }

    getAction() {
        return this.action
    }

    updateValues(s) {
        this.n += 1
        this.s += s
    }

    getUCBScore(parentNode, explorationFactor) {
        if (this.n == 0) {
            return 100000
        }
        else {
            return (this.s / this.n) + explorationFactor * Math.sqrt((2 * Math.log(parentNode.n)) / this.n)
        }

    }
}

// MCTS Algorithm
function mcts(numOfIterations, state, getPossibleActions, getNextState, simulateGame, getGain, maxNumActions, explorationFactor) {

    /**
     * Selection Phase
     * Returns the selected leaf node for expansion
     */
    function selectionPhase(root, explorationFactor) {
        const nodeList = [root]
        let currentNode = root
        while (!currentNode.isLeaf()) {
            // Select the child of the current node with the largest UCB score
            let highestUCBScore = 0
            let highestUCBChildIndex = -1
            const childNodes = currentNode.getChildren()
            for (let i = 0; i < childNodes.length; i++) {
                const currentUCB = childNodes[i].getUCBScore(currentNode, explorationFactor)

                if (currentUCB > highestUCBScore) {
                    highestUCBScore = currentUCB
                    highestUCBChildIndex = i
                }
            }
            currentNode = childNodes[highestUCBChildIndex]
            nodeList.push(currentNode)
        }
        return nodeList
    }

    /**
     * Expansion Phase
     */
    function expansionPhase(nodeList, getPossibleActions, getNextState, maxNumActions) {
        let selectedNode = nodeList[nodeList.length - 1]

        // Check if the game is not in a decisive state
        if (!selectedNode.state.isGameOver()) {
            selectedNode.createChildren(getPossibleActions, getNextState, maxNumActions)
            selectedNode = selectedNode.selectedRandomChild()
            nodeList.push(selectedNode)
        }

        return nodeList
    }

    /**
     * Simulation Phase
     */
    function simulationPhase(nodeList, simulateGame, getGain) {
        const simulatedGameState = simulateGame(nodeList[nodeList.length - 1].state)
        return getGain(simulatedGameState, nodeList[0].state)
    }

    // Backpropagation Phase
    function backpropagationPhase(nodeList, gain) {
        for (const node of nodeList) {
            node.updateValues(gain)
        }
    }

    // Body of algorithm

    // Create Root node
    const root = new Node(state)
    /**
     * Iterate over algorithm for pre selected number of iterations
     */
    for (let iterNum = 0; iterNum < numOfIterations; iterNum++) {
        if (iterNum % 100 == 0) {
            console.log(`Currently in ${iterNum} of MCTS algorithm`)
        }
        let nodeList = selectionPhase(root, explorationFactor)
        nodeList = expansionPhase(nodeList, getPossibleActions, getNextState, maxNumActions)
        const gain = simulationPhase(nodeList, simulateGame, getGain)
        backpropagationPhase(nodeList, gain)
    }

    // Select the child of the Root with the most number of Visits
    let highestNumVisits = 0
    let highestNumVisitsIndex = -1
    const childNodes = root.getChildren()
    for (let i = 0; i < childNodes.length; i++) {
        const currentNumOfVisits = childNodes[i].getNumOfVisits()
        console.log(`${i} has ${currentNumOfVisits}`)

        if (highestNumVisits < currentNumOfVisits) {
            highestNumVisits = currentNumOfVisits
            highestNumVisitsIndex = i
        }
    }

    return childNodes[highestNumVisitsIndex].getAction()

}


// Select random possible action
function selectRandomAction(possibleActions) {
    // const listPossibleActions = []

    // for (const [soldierNum, soldierPossibleActions] of Object.entries(possibleActions)) {
    //     for (const soldierPossibleAction of soldierPossibleActions) {
    //         listPossibleActions.push([soldierNum, soldierPossibleAction])
    //     }
    // }

    const randomActionNum = generateRandomInt(possibleActions.length)

    return possibleActions[randomActionNum]
}


// Play out random game
function playRandomVsRandom(gameState) {
    while (true) {
        // Army 1 move
        const possibleArmy1Moves = gameState.getCurrentArmyPossibleActions()
        const [army1SoldierNumToMove, army1ActionSelected] = selectRandomAction(possibleArmy1Moves)
        gameState.updateGameState(army1SoldierNumToMove, army1ActionSelected)

        if (gameState.isGameOver()) {
            return gameState.gameStatus
        }

        // Army 2 move
        const possibleArmy2Moves = gameState.getCurrentArmyPossibleActions()
        const [army2SoldierNumToMove, army2ActionSelected] = selectRandomAction(possibleArmy2Moves)
        gameState.updateGameState(army2SoldierNumToMove, army2ActionSelected)

        if (gameState.isGameOver()) {
            return gameState.gameStatus
        }
    }
}

function playMCTSVsRandom(gameState) {
    while (true) {
        // Army 1 move
        const possibleArmy1Moves = gameState.getCurrentArmyPossibleActions()
        const [army1SoldierNumToMove, army1ActionSelected] = mcts(100, gameState, jeeshGetPossibleActions, jeeshGetNextState, jeeshSimulateGame, jeeshGetGain, 5, 0.7)
        gameState.updateGameState(army1SoldierNumToMove, army1ActionSelected)

        if (gameState.isGameOver()) {
            return gameState.gameStatus
        }

        // Army 2 move
        const possibleArmy2Moves = gameState.getCurrentArmyPossibleActions()
        const [army2SoldierNumToMove, army2ActionSelected] = selectRandomAction(possibleArmy2Moves)
        gameState.updateGameState(army2SoldierNumToMove, army2ActionSelected)

        if (gameState.isGameOver()) {
            return gameState.gameStatus
        }
    }
}

let p1Wins = 0
let p2Wins = 0
let draws = 0


for (let i = 0; i < 1000; i++) {

    if (i % 100 == 0) {
        console.log(`Completed ${i} simulations`)
    }

    const testGameState = new GameState([
        [[5, 6, 10], [0, 0, -1]],
        [[5, 5, 10], [0, 0, -1]],
        [[5, 4, 10], [0, 0, -1]],

    ], [
        [[5, 6, 0], [0, 0, 1]],
        [[5, 5, 0], [0, 0, 1]],
        [[5, 4, 0], [0, 0, 1]],
    ])

    const resultStatus = playMCTSVsRandom(testGameState)

    if (resultStatus[0] == 0) {
        p1Wins += 1
    }
    else if (resultStatus[0] == 1) {
        p2Wins += 1
    }
    else if (resultStatus[0] == 2) {
        draws += 1
    }
}

console.log(`p1 Wins ${p1Wins}\tp2 Wins ${p2Wins}\tDraws ${draws}`)

// Testing the deep clone
// const a = new GameState([
//     [[5, 5, 10], [0, 0, -1]]

// ], [
//     [[5, 5, 0], [0, 0, 1]]
// ])

// const b = new GameState()
// b.clone(a)
// b.updateGameState(0, [[5, 5, 9], [0, 0, -1]])
// console.log(a)
// console.log(b)