import { MOVE_TIME_SECS } from "../globals"

export default class UserMove {

    constructor () {
        this.startingFlag = true,
        this.startTime = -1
        this.soldierNum = -1
        this.startingPosition = [-1, -1, -1]
        this.startingRotation = [-1, -1, -1]
        this.finishPosition = [-1, -1, -1]
        this.finishRotation = [-1, -1, -1]
    }

    setStartingParameters (startTime, startingPosition, startingRotation) {
        this.startTime = startTime
        this.startingPosition = startingPosition
        this.startingRotation = startingRotation
        this.startingFlag = false
    }

    getStartingFlag () {
        return this.startingFlag
    }

    resetStartingFlag () {
        this.startingFlag = true
    }

    getMovingPosition (elapsedTime) {
        const timeInMotion = elapsedTime - this.startTime

        if ((timeInMotion < 0) || (timeInMotion > MOVE_TIME_SECS)) {
            console.error('Time in motion out of bounds!')
        }

        return [
            this.startingRotation[0] + (timeInMotion / MOVE_TIME_SECS) * (this.finishRotation[0] - this.startingRotation[0]),
            this.startingRotation[1] + (timeInMotion / MOVE_TIME_SECS) * (this.finishRotation[1] - this.startingRotation[1]),
            this.startingRotation[2] + (timeInMotion / MOVE_TIME_SECS) * (this.finishRotation[2] - this.startingRotation[2])
        ]
    }

    getMovingRotation (elapsedTime) {
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