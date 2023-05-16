/**
 * Testing the Game Logic and the MCTS AI
 */

import randomJeeshAI from './random.js'
import { mctsBot1 } from './mcts.js'
import playGame from './play.js'
import GameState from '../game/gameState.js'

const TEST_STARTING_POSTIONS = [[
    [[5, 6, 10], [0, 0, -1]],
    [[5, 5, 10], [0, 0, -1]],
    [[5, 4, 10], [0, 0, -1]],

], [
    [[5, 6, 0], [0, 0, 1]],
    [[5, 5, 0], [0, 0, 1]],
    [[5, 4, 0], [0, 0, 1]],
]]
const TEST_NUM_OF_GAMES = 5

function match(AI1Func, AI2Func, numOfGames) {
    let p1Wins = 0
    let p2Wins = 0
    let draws = 0

    for (let i = 0; i < numOfGames; i++) {

        if (i % 10 == 0) {
            console.log(`Completed ${i} simulations`)
        }

        const testGameState = new GameState(...TEST_STARTING_POSTIONS)

        const resultStatus = playGame(testGameState, AI1Func, AI2Func)

        if (resultStatus === 0) {
            p1Wins += 1
        }
        else if (resultStatus === 1) {
            p2Wins += 1
        }
        else if (resultStatus === 2) {
            draws += 1
        }
    }
    console.log([p1Wins, p2Wins, draws])
    return [p1Wins, p2Wins, draws]
}

function testAIvAI () {
    return match(randomJeeshAI, randomJeeshAI, TEST_NUM_OF_GAMES)
}

function testMCTSvAI () {
    return match(mctsBot1, randomJeeshAI, TEST_NUM_OF_GAMES)
}

function testAIvMCTS () {
    return match(randomJeeshAI, mctsBot1, TEST_NUM_OF_GAMES)
}

function testMCTSvMCTS () {
    return match(mctsBot1, mctsBot1, TEST_NUM_OF_GAMES)
}


export function testAllAI () {
    const testAIvAIResult = testAIvAI()
    console.log(`RANDOM V RANDOM\t\t${testAIvAIResult[0]} P1 ${testAIvAIResult[2]} D ${testAIvAIResult[1]} P2`)
}
