/**
 * Testing the Game Logic and the MCTS AI
 */

import randomJeeshAI from "../modules/ai/random.js"
import { mctsBot1 } from '../modules/ai/mcts.js'
import playGame from "../modules/ai/play.js"
import GameState from "../modules/game/gameState.js"

function match(AI1Func, AI2Func, numOfGames) {
    let p1Wins = 0
    let p2Wins = 0
    let draws = 0

    for (let i = 0; i < numOfGames; i++) {

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

        const resultStatus = playGame(testGameState, AI1Func, AI2Func)

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

    return [p1Wins, p2Wins, draws]
}



console.log(match(randomJeeshAI, randomJeeshAI, 1000))