/**
 * Node for the Monte Carlo Tree Search Algorithm
 */

import { generateRandomInt } from '../globals/number.js'
import { getRandomSubarray } from '../globals/array.js'

const MAX_UCB_SCORE = 1000000

/**
 * Node for the Search Tree
 */
export default class NodeMCTS {

    constructor(state, action) {

        // Action taken on the previous state to get to this state
        this.action = action
        this.state = state
        this.children = []

        // For calculating the UCB Score
        this.n = 0
        this.s = 0
    }

    /**
     * Checks if the Node is a leaf node
     */
    isLeaf() {
        return (this.children.length === 0)
    }

    /**
     * Create list of children from list of possible actions
     */
    createChildren(getPossibleActions, getNextState, maxNumActions) {

        let possibleActions = getPossibleActions(this.state)

        // Select only a predefined number of random possible actions to save memory
        if (possibleActions.length > maxNumActions) {
            possibleActions = getRandomSubarray(possibleActions, maxNumActions)
        }

        for (const action of possibleActions) {
            this.children.push(new NodeMCTS(getNextState(this.state, action), action))
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
     * Gets a list of children nodes
     */
    getChildren() {
        return this.children
    }

    /**
     * Gets the number of visits to this node
     */
    getNumOfVisits() {
        return this.n
    }

    /**
     * Gets the action in which resulted in this node
     */
    getAction() {
        return this.action
    }

    /**
     * Updates the n & s values at the Backpropagation Phase
     */
    updateValues(s) {
        this.n += 1
        this.s += s
    }

    /**
     * Returns the UCB1 score
     */
    getUCBScore(parentNode, explorationFactor) {
        /**
         * If the node has never been visited, to avoid div by 0 errors
         */
        if (this.n === 0) {
            return MAX_UCB_SCORE
        }
        else {
            return (this.s / this.n) + explorationFactor * Math.sqrt((2 * Math.log(parentNode.n)) / this.n)
        }
    }
}