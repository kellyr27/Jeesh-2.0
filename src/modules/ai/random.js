/**
 * AI that plays a move selected at Random
 */

import {selectRandomAction} from './transfer.js'

export default function randomJeeshAI (initialState) {
    const possibleMoves = initialState.getCurrentArmyPossibleMoves()
    return selectRandomAction(possibleMoves)
}