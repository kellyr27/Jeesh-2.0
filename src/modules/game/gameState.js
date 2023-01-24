/**
 * GAME STATE
 * Jeesh is a two player, turn based game.
 * Each Player has one Army.
 */

import Army from "./army.js"
import { arrayEquals, arrayInArray, isNumBetween, generateRandomInt, MAX_NUM_STARS, ARENA_SIZE } from "../globals.js"

export default class GameState {

    constructor(army1StartingPositions, army2StartingPositions) {
        if (army2StartingPositions !== undefined) {
            this.starCoordinates = this.#createStars()
            this.armies = this.#createArmies(army1StartingPositions, army2StartingPositions)
            this.currentMoveNum = 1
            this.currentArmyNum = 0
            this.gameStatus = [-1, -1]
        }
    }

    /**
     * Creates a clone of a game state
     */
    clone(existingGameState) {
        this.starCoordinates = structuredClone(existingGameState.starCoordinates)
        this.currentMoveNum = structuredClone(existingGameState.currentMoveNum)
        this.currentArmyNum = structuredClone(existingGameState.currentArmyNum)
        this.gameStatus = structuredClone(existingGameState.gameStatus)

        this.armies = [new Army(), new Army()]
        this.armies[0].clone(existingGameState.armies[0])
        this.armies[1].clone(existingGameState.armies[1])
    }

    /**
     * Generates a list of random star positions for a random number of stars (up to MAX_STARS)
     * Stars cannot be touching the edge of the ARENA
     */
    #createStars() {
        const numStars = generateRandomInt(MAX_NUM_STARS)
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
     * Get a list of coordinates of the stars for display
     */
    getStars () {
        return this.starCoordinates
    }

    /**
     * Generates two armies in the starting positions
     */
    #createArmies(army1StartingPositions, army2StartingPositions) {
        return [new Army(army1StartingPositions), new Army(army2StartingPositions)]
    }

    /**
     * Checks if two coordinates are the same
     */
    #isCoordinateEqual(coord1, coord2) {
        return arrayEquals(coord1, coord2)
    }

    /**
     * Checks if an coordinate appears in an array of coordinates
     */
    #isCoordinateInArray(coord, arr) {
        if (arrayInArray(coord, arr)) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * Returns the current Army number to move
     */
    getCurrentArmyNum() {
        return this.currentArmyNum
    }

    /**
     * Returns the opposing Armies number to move
     */
    getOpposingArmyNum(armyNum) {
        return ((armyNum === 0) ? 1 : 0)
    }

    /**
     * Gets an array of attacked coordinates from a given position
     */
    #getAttackedCoordinatesfromPosition(position) {
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
     * NOTE: Duplicates have not been removed
     */
    getArmyAttackedCoordinates(moveNum, armyNum) {
        let armyAttackedCoordinates = []
        for (const soldier of this.armies[armyNum].soldiers) {
            if (soldier.isAlive(moveNum)) {
                armyAttackedCoordinates = [...armyAttackedCoordinates, ...this.#getAttackedCoordinatesfromPosition(soldier.getPosition(moveNum))]
            }
        }

        return armyAttackedCoordinates
    }

    /**
     * Returns a list of possible moves for an given soldier for an given army at an given move
     */
    getSoldierPossibleMoves(moveNum, armyNum, soldierNum) {

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
                    if ((x === 0) && (y === 0) && (z === 0)) {
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
                    if (x === coord[0] + 1) {
                        soldierPossibleActions.push([[x, y, z], [1, 0, 0]])
                    }

                    // Facing the -x direction
                    if (x === coord[0] - 1) {
                        soldierPossibleActions.push([[x, y, z], [-1, 0, 0]])
                    }

                    // Facing the +y direction
                    if (y === coord[1] + 1) {
                        soldierPossibleActions.push([[x, y, z], [0, 1, 0]])
                    }

                    // Facing the -y direction
                    if (y === coord[1] - 1) {
                        soldierPossibleActions.push([[x, y, z], [0, -1, 0]])
                    }

                    // Facing the +z direction
                    if (z === coord[2] + 1) {
                        soldierPossibleActions.push([[x, y, z], [0, 0, 1]])
                    }

                    // Facing the -z direction
                    if (z === coord[2] - 1) {
                        soldierPossibleActions.push([[x, y, z], [0, 0, -1]])
                    }
                }
            }
        }

        return soldierPossibleActions
    }

    getSoldierCurrentPosition(armyNum, soldierNum) {
        return this.armies[armyNum].soldiers[soldierNum].getPosition(this.currentMoveNum)
    }

    /**
     * Gets a list of possible moves for a Soldier at the current move
     */
    getSoldierCurrentPossibleMoves(armyNum, soldierNum) {
        return this.getSoldierPossibleMoves(this.currentMoveNum, armyNum, soldierNum)
    }

    /**
     * Returns a list of possible moves for an given Army at an given move
     * a MOVE is in the form of [Soldier index, POSITION]
     */
    getArmyPossibleMoves(moveNum, armyNum) {
        let armyPossibleMoves = []


        for (let i = 0; i < this.armies[armyNum].soldiers.length; i++) {

            for (const possibleMove of this.getSoldierPossibleMoves(moveNum, armyNum, i)) {
                armyPossibleMoves.push([i, possibleMove])
            }
        }

        return armyPossibleMoves
    }

    /**
     * Get current Armies possible moves
     */
    getCurrentArmyPossibleMoves() {
        return this.getArmyPossibleMoves(this.currentMoveNum, this.currentArmyNum)
    }

    /**
     * If the game position has been repeated three times.
     */
    #checkDrawByRepetition(moveNum) {
        return false
    }

    /**
     * If both Armies have no soldiers remaining, the game is automatically a draw by default.
     */
    #checkDrawByDefault(moveNum) {
        if ((this.armies[0].getAliveCount() === 0) && (this.armies[1].getAliveCount(moveNum) === 0)) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * If 500 moves have been played, the game is automatically a draw.
     */
    #checkDrawByMaxMoves(moveNum) {
        if (moveNum === 500) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * If either army has entered the opposing Armies gate, then that Army wins.
     * Army 1's gate is located at [5,5,10], Army 2's gate is located at [5,5,0]
     */
    #checkWinByCapture(moveNum, armyNum) {

        if (armyNum === 0) {
            for (const soldier of this.armies[0].soldiers) {
                if (this.#isCoordinateEqual(soldier.getPosition(moveNum)[0], [5, 5, 0])) {
                    return true
                }
            }
        }
        else if (armyNum === 1) {
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
     * If one army has no remaining soldiers, the other wins by default.
     */
    #checkWinByDefault(moveNum, armyNum) {
        if ((this.armies[armyNum].getAliveCount() !== 0) && (this.armies[this.getOpposingArmyNum(armyNum)].getAliveCount(moveNum) === 0)) {
            return true
        }
        else {
            return false
        }
    }

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
     *           1 - By Capture (one Army has entered the opposing Armies gate coordinate)
     */
    updateGameStatus(moveNum, armyNum) {
        if (this.#checkDrawByDefault(moveNum)) {
            this.gameStatus = [2, 0]
            return
        }
        else if (this.#checkDrawByMaxMoves(moveNum)) {
            this.gameStatus = [2, 2]
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
     * Checks whether the game is still in Play
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
     * Prints how the game ended to the console.
     */
    printEndOfGameStatus() {
        if (!this.isGameOver()) {
            console.error('Game is not over, cannot print Game Status!')
            return
        }

        if (this.gameStatus[0] === 0) {
            if (this.gameStatus[1] === 0) {
                console.log('Army 1 wins by Default!')
                return
            }
            if (this.gameStatus[1] === 1) {
                console.log('Army 1 wins by Capture!')
                return
            }
        }
        else if (this.gameStatus[0] === 1) {
            if (this.gameStatus[1] === 0) {
                console.log('Army 2 wins by Default!')
                return
            }
            if (this.gameStatus[1] === 1) {
                console.log('Army 2 wins by Capture!')
                return
            }
        }
        else if (this.gameStatus[0] === 2) {
            if (this.gameStatus[1] === 0) {
                console.log('Draw by Default!')
                return
            }
            if (this.gameStatus[1] === 1) {
                console.log('Draw by Repetition!')
                return
            }
            if (this.gameStatus[2] === 2) {
                console.log('Draw by Max Moves Reached!')
            }
        }
    }

    /**
     * Updates the Soldier's position when a move has been played
     */
    playMove(moveNum, armyNum, soldierNum, position) {
        this.armies[armyNum].soldiers[soldierNum].setPosition(moveNum, position)
    }

    /**
     * Updates all soldiers alive/dead status when a given move has been played
     */
    updateArmies(moveNum, armyNum, soldierNum, position) {

        // Check whether the Soldier has moved into the opposing Armies attacked Zone
        if (this.#isCoordinateInArray(position[0], this.getArmyAttackedCoordinates(moveNum, this.getOpposingArmyNum()))) {
            this.armies[armyNum].soldiers[soldierNum].setDeath(moveNum)
        }

        // Check whether any opposing Soldier is in the new attacked Zone
        const newAttackedZone = this.#getAttackedCoordinatesfromPosition(position)
        for (const soldier of this.armies[this.getOpposingArmyNum(armyNum)].soldiers) {
            if (this.#isCoordinateInArray(soldier.getPosition(moveNum)[0], newAttackedZone)) {
                soldier.setDeath(moveNum)
            }
        }
    }

    /**
     * Updates everything necessary when a move has been played
     */
    updateGameState(soldierNum, position) {

        if (this.isGameOver()) {
            console.error('Cannot execute move. Game is over!')
            return
        }

        this.playMove(this.currentMoveNum, this.currentArmyNum, soldierNum, position)
        this.updateArmies(this.currentMoveNum, this.currentArmyNum, soldierNum, position)
        this.updateGameStatus(this.currentMoveNum, this.currentArmyNum)

        // When the game is over, the result will print to the console
        if (this.isGameOver()) {
            // this.printEndOfGameStatus()
            return
        }

        this.currentArmyNum = this.getOpposingArmyNum(this.currentArmyNum)
        this.currentMoveNum += 1

    }

    /**
     * Returns the game result
     *      0 - Win by Army 1
     *      1 - Win by Army 2
     *      2 - Draw
     */
    getResult () {
        if (this.gameStatus[0] === -1) {
            console.error('Requesting the result and the game has not finished!')
        }
        else {
            return this.gameStatus[0]
        }
    }

    /**
     * Returns the current Positions for a selected Army
     */
    getArmyCurrentPositions (armyNum) {
        return this.armies[armyNum].getPositions(this.currentMoveNum)
    }

    /**
     * Returns a list of current Attacked Coordinates for a selected Army
     * NOTE: Includes duplicates
     */
    getArmyCurrentAttackedCoordinates(armyNum) {
        return this.getArmyAttackedCoordinates(this.currentMoveNum, armyNum)
    }

    /**
     * ----------- DESIGNED FOR TESTING PURPOSES -----------
     * Prints a 2D Representation of the Game in the command line for visual testing purposes
     */
    printConsole() {
        const army1Coordinates = this.armies[0].getCoordinates(this.currentMoveNum)
        const army2Coordinates = this.armies[1].getCoordinates(this.currentMoveNum)

        const army1AttackedCoordinates = this.getArmyAttackedCoordinates(this.currentMoveNum, 0)
        const army2AttackedCoordinates = this.getArmyAttackedCoordinates(this.currentMoveNum, 1)

        /**
         * Display Legend
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