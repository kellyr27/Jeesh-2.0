/**
 * Objective is to Multithread the MCTS Algorithm
 */

import {jeeshSimulateGame, jeeshGetNextState, jeeshGetGain, jeeshGetPossibleActions} from './transfer.js'
import NodeMCTS from './node.js'


const EXPLORATION_FACTOR = 0.7

/**
 * Selection Phase
 * Returns an list of nodes that connect the Root node to the Selected Node
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
 * Returns an list of nodes that connect the Root node to the new Selected Node (expanded)
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
 * Returns the gain from an Simulated (random) game
 */
function simulationPhase(nodeList, simulateGame, getGain) {
    const simulatedGameState = simulateGame(nodeList[nodeList.length - 1].state)
    return getGain(simulatedGameState, nodeList[0].state)
}

/**
 * Backpropagation Phase
 * Updates the node values from the Root to the Selected Node with the gain from the Simulation Phase
 */
function backpropagationPhase(nodeList, gain) {
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

const ITERATIONS_PER_TICK = 2

export default class Mcts {
    getPossibleActionsFunc = jeeshGetPossibleActions
    getNextStateFunc = jeeshGetNextState
    simulateGameFunc = jeeshSimulateGame
    getGainFunc = jeeshGetGain
    
    constructor (maxNumActions, initialState) {
        this.maxNumActions = maxNumActions
    }

    create(initialState) {
        this.status = true
        this.currentIteration = 0
        this.currentStage = 0

        this.root = new NodeMCTS(initialState)
        this.nodeList = null
        this.gain = null
    }

    getStatus() {
        return this.status
    }

    continueExecution() {
        if (this.currentIteration >= this.maxNumActions) {
            this.status = false
            return
        }
        
        for (let i = 0; i < ITERATIONS_PER_TICK; i++) {
            this.nodeList = selectionPhase(this.root, EXPLORATION_FACTOR)
            this.nodeList = expansionPhase(this.nodeList, this.getPossibleActionsFunc, this.getNextStateFunc, this.maxNumActions)
            this.gain = simulationPhase(this.nodeList, this.simulateGameFunc, this.getGainFunc)
            backpropagationPhase(this.nodeList, this.gain)
            this.currentIteration += 1
        }
    }

    OLD_continueExecution() {
        if (this.currentIteration >= this.maxNumActions) {
            this.status = false
            return
        }
        switch (this.currentStage) {
            case 0:
                this.nodeList = selectionPhase(this.root, EXPLORATION_FACTOR)
                this.currentStage = 1
                return
            case 1:
                this.nodeList = expansionPhase(this.nodeList, this.getPossibleActionsFunc, this.getNextStateFunc, this.maxNumActions)
                this.currentStage = 2
                return
            case 2:
                this.gain = simulationPhase(this.nodeList, this.simulateGameFunc, this.getGainFunc)
                this.currentStage = 3
                return
            case 3:
                backpropagationPhase(this.nodeList, this.gain)
                this.currentStage = 0
                this.currentIteration += 1
                return
        }
    }

    getChoosenAction () {
        const chosenState = chooseAction(this.root)
        return chosenState.getAction()
    }


}