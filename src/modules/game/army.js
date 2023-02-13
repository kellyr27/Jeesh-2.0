/**
 * ARMY
 * An Army is a Players set of Soldiers (game pieces).
 * If every Soldier in an Army is dead, then that Player has either lost (if the other Army has remaining Soldiers) or a draw.
 */

import Soldier from "./soldier.js"

export default class Army {

    constructor(startingPositions) {
        if (startingPositions !== undefined) {
            this.soldiers = this.#createSoldiers(startingPositions)
        }
    }

    /**
     * Creates a clone of an Army
     */
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
    #createSoldiers(startingPositions) {
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
     * Gets an array of Soldier Positions at an given move
     */
    getPositions(moveNum) {
        const positions = []

        for (const soldier of this.soldiers) {
            if (soldier.isAlive(moveNum)) {
                positions.push(soldier.getPosition(moveNum))
            }
        }

        return positions
    }

    /**
     * Gets an array of Soldier coordinates at an given move.
     */
    getCoordinates(moveNum) {
        return this.getPositions(moveNum).map((pos) => {
            return pos[0]
        })
    }

    /**
     * Gets list of list of all Soldiers previous positions
     */
    getAllSoldiersPositions () {
        return this.soldiers.map(soldier => {
            return soldier.getAllPositions()
        })
    }

}

let a = new Army([[[1, 1, 1], [0, 0, 1]]])