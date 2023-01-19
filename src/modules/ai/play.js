/**
 * Play out a game of Jeesh between two selected AI
 * The AI inputs take in an Game State and output the AI's selected move
 */
export default function playGame(gameState, AI1Func, AI2Func) {
    while (true) {
        // Army 1 move
        const [army1SoldierNumToMove, army1ActionSelected] = AI1Func(gameState)
        gameState.updateGameState(army1SoldierNumToMove, army1ActionSelected)

        if (gameState.isGameOver()) {
            return gameState.getResult()
        }

        // Army 2 move
        const [army2SoldierNumToMove, army2ActionSelected] = AI2Func(gameState)
        gameState.updateGameState(army2SoldierNumToMove, army2ActionSelected)

        if (gameState.isGameOver()) {
            return gameState.getResult()
        }
    }
}