import { MOVE_TIME_SECS } from "../globals"
/**
 * Change Rotation to Direction and figure out the math
 */

export default class Move {

    constructor () {
        // this.inMotion = false
        this.startingFlag = true,
        this.startTime = -1
        this.soldierNum = -1
        this.startingPosition = [-1, -1, -1]
        this.startingRotation = [-1, -1, -1]
        this.finishPosition = [-1, -1, -1]
        this.finishRotation = [-1, -1, -1]
    }

    getMove () {
        return [this.finishPosition, this.finishRotation]
    }

    setInMotion (startTime) {
        this.startTime = startTime
        // this.inMotion = true
    }

    setSoldierNum (soldierNum) {
        this.soldierNum = soldierNum
    }

    getSoldierNum() {
        return this.soldierNum
    }

    setStartingParameters (startingPosition, finishPosition) {
        // this.startTime = startTime
        this.startingPosition = startingPosition[0]
        this.startingRotation = startingPosition[1]
        this.finishPosition = finishPosition[0]
        this.finishRotation = finishPosition[1]
    }

    setStartTime (startTime) {
        this.startTime = startTime
        this.startingFlag = false
    }

    getStartingFlag () {
        return this.startingFlag
    }

    resetStartingFlag () {
        this.startingFlag = true
    }

    getTimeInMotion (elapsedTime) {
        return elapsedTime - this.startTime
    }

    getMovingRotation (elapsedTime) {
        const timeInMotion = this.getTimeInMotion(elapsedTime)

        if ((timeInMotion < 0) || (timeInMotion > MOVE_TIME_SECS)) {
            console.error('Time in motion out of bounds!')
        }

        return [
            this.startingRotation[0] + (timeInMotion / MOVE_TIME_SECS) * (this.finishRotation[0] - this.startingRotation[0]),
            this.startingRotation[1] + (timeInMotion / MOVE_TIME_SECS) * (this.finishRotation[1] - this.startingRotation[1]),
            this.startingRotation[2] + (timeInMotion / MOVE_TIME_SECS) * (this.finishRotation[2] - this.startingRotation[2])
        ]
    }

    getMovingPosition (elapsedTime) {
        const timeInMotion = elapsedTime - this.startTime

        if ((timeInMotion < 0) || (timeInMotion > MOVE_TIME_SECS)) {
            console.error('Time in motion out of bounds!')
        }

        return [
            this.startingPosition[0] + (timeInMotion / MOVE_TIME_SECS) * (this.finishPosition[0] - this.startingPosition[0]),
            this.startingPosition[1] + (timeInMotion / MOVE_TIME_SECS) * (this.finishPosition[1] - this.startingPosition[1]),
            this.startingPosition[2] + (timeInMotion / MOVE_TIME_SECS) * (this.finishPosition[2] - this.startingPosition[2])
        ]
    }
}