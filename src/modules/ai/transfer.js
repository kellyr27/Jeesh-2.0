/**
 * Transfer Functions
 * 
 * These functions connect the GameState class (which stores a game of Jeesh) to the MCTS Algorithm.
 * 
 * MCTS Terminology
 *  Actions - another word for a 'move'
 *  State - another word for a specific game position.
 */

import GameState from "../game/gameState.js"
import {generateRandomInt} from '../globals.js'

/**
 * Gets a list of possible actions from a given Game State
 */
export function jeeshGetPossibleActions(state) {
    return state.getCurrentArmyPossibleMoves()
}

/**
 * Returns the resulting Game State after an move has been played on a specific State
 */
export function jeeshGetNextState(state, action) {

    // Create a clone state for next state to return
    const nextState = new GameState()
    nextState.clone(state)

    const [soldierNumToMove, positionSelected] = action
    nextState.updateGameState(soldierNumToMove, positionSelected)

    return nextState
}

/**
 * Select random action from a list of possible actions
 */
function selectRandomAction(possibleActions) {
    const randomActionNum = generateRandomInt(possibleActions.length)
    return possibleActions[randomActionNum]
}

/**
 * Simulates a game of Jeesh from a given State and returns the final state of that game
 */
export function jeeshSimulateGame(state) {

    // Create a clone to avoid altering the input state
    const simulationState = new GameState()
    simulationState.clone(state)

    // Simulate a random game of Jeesh
    while (!simulationState.isGameOver()) {
        const possibleActions = simulationState.#getCurrentArmyPossibleMoves()
        const [soldierNumToMove, actionSelected] = selectRandomAction(possibleActions)
        simulationState.updateGameState(soldierNumToMove, actionSelected)
    }

    return simulationState
}

/**
 * Returns the gain given an finished game
 * Depending on which Army we want to maximize the gain for.
 * Gain:
 *      0 - Loss
 *      0.5 - Draw
 *      1 - Win
 */
export function jeeshGetGain(state, rootState) {
    const result = state.getResult()

    // Game was a draw
    if (result === 2) {
        return 0.5
    }
    // Game ended in win for Army 1
    else if (result === 0) {
        if (rootState.getCurrentArmyNum() === 0) {
            return 1
        }
        else {
            return 0
        }
    }
    // Game ended in win for Army 2
    else if (result === 1) {
        if (rootState.getCurrentArmyNum() === 0) {
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