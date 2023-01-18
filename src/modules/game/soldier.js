/**
 * SOLDIER
 * A Soldier is a game piece.
 * A Soldier to any surrounding square (imagine a Rubik's cube with the Soldier being the centre)
 * Once a soldier is Dead, it can no longer be moved.
 */

class Soldier {

    constructor(startingPosition) {
        if (startingPosition !== undefined) {
            this.positions = {
                0: startingPosition
            }
            this.deathIndex = -1
        }
    }

    /**
     * Creates a clone of a Soldier
     */
    clone(existingSoldier) {
        this.positions = structuredClone(existingSoldier.positions)
        this.deathIndex = structuredClone(existingSoldier.deathIndex)
    }

    /**
     * Checks whether the Soldier is alive at an given move.
     */
    isAlive(moveNum) {
        if (this.deathIndex === -1) {
            return true
        }
        else if (this.deathIndex > moveNum) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * Sets the move number at which the Soldier died.
     */
    setDeath(moveNum) {
        this.deathIndex = moveNum
    }

    /**
     * Gets the Soldiers position at a given move.
     * NOTE: Does not check whether the Soldiers status (alive/dead) at a the given position
     */
    getPosition(moveNum) {
        const foundPositionIndex = Object.keys(this.positions).reverse().find(el => parseInt(el) <= moveNum)
        return this.positions[foundPositionIndex]
    }

    /**
     * Sets the Soliders position at an given move.
     */
    setPosition(moveNum, position) {
        this.positions[moveNum] = position
    }

}