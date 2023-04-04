/**
 * Monte Carlo Tree Search Algorithm
 */

import {jeeshSimulateGame, jeeshGetNextState, jeeshGetGain, jeeshGetPossibleActions} from './transfer.js'
import NodeMCTS from './node.js'

/**
 * Selection Phase
 * Returns an list of nodes that connect the Root node to the Selected Node
 */
export function selectionPhase(root, explorationFactor) {
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
 * Returns an list of nodes that connect the Root node to the new Selected Node (expanded)
 */
export function expansionPhase(nodeList, getPossibleActions, getNextState, maxNumActions) {
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
 * Returns the gain from an Simulated (random) game
 */
export function simulationPhase(nodeList, simulateGame, getGain) {
    const simulatedGameState = simulateGame(nodeList[nodeList.length - 1].state)
    return getGain(simulatedGameState, nodeList[0].state)
}

/**
 * Backpropagation Phase
 * Updates the node values from the Root to the Selected Node with the gain from the Simulation Phase
 */
export function backpropagationPhase(nodeList, gain) {
    for (const node of nodeList) {
        node.updateValues(gain)
    }
}

/**
 * Select the child of the Root with the most number of Visits
 */
function chooseAction(rootState) {

    let highestNumVisits = 0
    let highestNumVisitsIndex = -1

    const childNodes = rootState.getChildren()
    for (let i = 0; i < childNodes.length; i++) {
        const currentNumOfVisits = childNodes[i].getNumOfVisits()

        if (highestNumVisits < currentNumOfVisits) {
            highestNumVisits = currentNumOfVisits
            highestNumVisitsIndex = i
        }
    }

    return childNodes[highestNumVisitsIndex]
}

/**
 * Monte Carlo Tree Search Algorithm
 */
export function mcts(numOfIterations, initialState, getPossibleActionsFunc, getNextStateFunc, simulateGameFunc, getGainFunc, maxNumActions, explorationFactor) {

    // Create Root node
    const root = new NodeMCTS(initialState)

    // Iterate over algorithm for pre selected number of iterations
    for (let iterNum = 0; iterNum < numOfIterations; iterNum++) {
        let nodeList = selectionPhase(root, explorationFactor)
        nodeList = expansionPhase(nodeList, getPossibleActionsFunc, getNextStateFunc, maxNumActions)
        const gain = simulationPhase(nodeList, simulateGameFunc, getGainFunc)
        backpropagationPhase(nodeList, gain)
    }

    // Select the child of the Root with the most number of Visits
    const chosenState = chooseAction(root)
    return chosenState.getAction()
}

/**
 * MCTS Bot 1
 * - 1000 Iterations / move
 * - Maximum of 5 moves per state
 * - Exploration factor of 0.7
 */
export function mctsBot1(initialState) {
    return mcts(1000, initialState, jeeshGetPossibleActions, jeeshGetNextState, jeeshSimulateGame, jeeshGetGain, 5, 0.7)
}

/**
 * Async
 */
export function selectionPhasePromise (root, explorationFactor) {
    return new Promise((resolve, reject) => {
        resolve(selectionPhase(root, explorationFactor))
    })
}

export function expansionPhasePromise (nodeList, getPossibleActions, getNextState, maxNumActions) {
    return new Promise((resolve, reject) => {
        resolve(expansionPhase(nodeList, getPossibleActions, getNextState, maxNumActions))
    })
}

export function simulationPhasePromise (nodeList, simulateGame, getGain) {
    return new Promise((resolve, reject) => {
        resolve(simulationPhase(nodeList, simulateGame, getGain))
    })
}

export function backpropagationPhasePromise (nodeList, gain) {
    return new Promise((resolve, reject) => {
        resolve(backpropagationPhase(nodeList, gain))
    })
}

export function chooseActionPromise(rootState) {
    return new Promise((resolve, reject) => {
        resolve(chooseAction(rootState))
    })
}

/**
 * Monte Carlo Tree Search Algorithm Async
 */
export async function mctsAsync(numOfIterations, initialState, getPossibleActionsFunc, getNextStateFunc, simulateGameFunc, getGainFunc, maxNumActions, explorationFactor) {

    // Create Root node
    const root = new NodeMCTS(initialState)

    // Iterate over algorithm for pre selected number of iterations
    for (let iterNum = 0; iterNum < numOfIterations; iterNum++) {
        let nodeList = await selectionPhasePromise(root, explorationFactor)
        nodeList = await expansionPhasePromise(nodeList, getPossibleActionsFunc, getNextStateFunc, maxNumActions)
        const gain = await simulationPhasePromise(nodeList, simulateGameFunc, getGainFunc)
        await backpropagationPhasePromise(nodeList, gain)
    }

    // Select the child of the Root with the most number of Visits
    const chosenState = await chooseActionPromise(root)
    return chosenState.getAction()
}

/**
 * MCTS Bot 1
 * - 1000 Iterations / move
 * - Maximum of 5 moves per state
 * - Exploration factor of 0.7
 */
export async function mctsBot1Async(initialState) {
    return mctsAsync(1000, initialState, jeeshGetPossibleActions, jeeshGetNextState, jeeshSimulateGame, jeeshGetGain, 5, 0.7)
}