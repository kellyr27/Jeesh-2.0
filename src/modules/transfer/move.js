import { MOVE_TIME_SECS, GLOBALS } from "../globals/game/constants"
import { addArrays, arrayEquals } from "../globals/array"
import { getSpecializedMidPoint, BezierQuadraticThreeDim, BezierQuadraticDerivativeThreeDim } from "../display/bezierMovement"
/**
 * Change Rotation to Direction and figure out the math
 */

export default class Move {

    constructor() {
        this.motionLock = false
        this.startingFlag = true,
            this.startTime = -1
        this.previousTimeInMotion = -1
        this.soldierNum = -1
        this.startingPosition = [-1, -1, -1]
        this.startingRotation = [-1, -1, -1]
        this.finishPosition = [-1, -1, -1]
        this.finishRotation = [-1, -1, -1]
    }

    getLineDisplay () {
        return [
            [this.startingPosition, this.startingRotation],
            [this.finishPosition, this.finishRotation]
        ]
    }

    #setRotation() {
        const rotation = this.#findRotation()

        if (rotation[0] !== 0) {
            this.rotationAxis = 0
            this.rotationAngle = rotation[0]
        }
        else if (rotation[1] !== 0) {
            this.rotationAxis = 1
            this.rotationAngle = rotation[1]
        }
        else if (rotation[2] !== 0) {
            this.rotationAxis = 2
            this.rotationAngle = rotation[2]
        }
    }

    #findRotation() {
        if (arrayEquals(this.startingRotation, [0, 0, 1])) {
            if (arrayEquals(this.finishRotation, [0, 0, 1])) {
                return [0, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 0, -1])) {
                return [0, 0, Math.PI]
            }
            else if (arrayEquals(this.finishRotation, [0, 1, 0])) {
                return [-Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, -1, 0])) {
                return [Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [1, 0, 0])) {
                return [0, 0, Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [-1, 0, 0])) {
                return [0, 0, -Math.PI / 2]
            }
        }
        else if (arrayEquals(this.startingRotation, [0, 0, -1])) {
            if (arrayEquals(this.finishRotation, [0, 0, 1])) {
                return [0, 0, Math.PI]
            }
            else if (arrayEquals(this.finishRotation, [0, 0, -1])) {
                return [0, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 1, 0])) {
                return [Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, -1, 0])) {
                return [-Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [1, 0, 0])) {
                return [0, 0, Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [-1, 0, 0])) {
                return [0, 0, -Math.PI / 2]
            }
        }
        else if (arrayEquals(this.startingRotation, [0, 1, 0])) {
            if (arrayEquals(this.finishRotation, [0, 0, 1])) {
                return [Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 0, -1])) {
                return [-Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 1, 0])) {
                return [0, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, -1, 0])) {
                return [Math.PI, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [1, 0, 0])) {
                return [0, 0, Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [-1, 0, 0])) {
                return [0, 0, -Math.PI / 2]
            }
        }
        else if (arrayEquals(this.startingRotation, [0, -1, 0])) {

            if (arrayEquals(this.finishRotation, [0, 0, 1])) {
                return [-Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 0, -1])) {
                return [Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 1, 0])) {
                return [Math.PI, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, -1, 0])) {
                return [0, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [1, 0, 0])) {
                return [0, 0, Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [-1, 0, 0])) {
                return [0, 0, - Math.PI / 2]
            }
        }
        else if (arrayEquals(this.startingRotation, [1, 0, 0])) {
            if (arrayEquals(this.finishRotation, [0, 0, 1])) {
                return [-Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 0, -1])) {
                return [Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 1, 0])) {
                return [0, 0, Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [0, -1, 0])) {
                return [0, 0, -Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [1, 0, 0])) {
                return [0, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [-1, 0, 0])) {
                return [Math.PI, 0, 0]
            }
        }
        else if (arrayEquals(this.startingRotation, [-1, 0, 0])) {
            if (arrayEquals(this.finishRotation, [0, 0, 1])) {
                return [-Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 0, -1])) {
                return [Math.PI / 2, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [0, 1, 0])) {
                return [0, 0, -Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [0, -1, 0])) {
                return [0, 0, Math.PI / 2]
            }
            else if (arrayEquals(this.finishRotation, [1, 0, 0])) {
                return [Math.PI, 0, 0]
            }
            else if (arrayEquals(this.finishRotation, [-1, 0, 0])) {
                return [0, 0, 0]
            }
        }
    }

    getMove() {
        return [this.finishPosition, this.finishRotation]
    }

    setMotionLock() {
        this.motionLock = true
    }

    resetMotionLock() {
        this.motionLock = false
    }

    getMotionLock() {
        return this.motionLock
    }

    getStartTime() {
        return this.startTime
    }

    setSoldierNum(soldierNum) {
        this.soldierNum = soldierNum
    }

    getSoldierNum() {
        return this.soldierNum
    }

    setStartingParameters(startingPosition, finishPosition) {
        this.startingPosition = startingPosition[0]
        this.startingRotation = startingPosition[1]
        this.finishPosition = finishPosition[0]
        this.finishRotation = finishPosition[1]
        this.bezierQuadraticPoints = getSpecializedMidPoint(startingPosition, finishPosition)
        this.#setRotation()
    }

    setStartTime(startTime) {
        this.startTime = startTime
        this.previousTimeInMotion = startTime
        this.startingFlag = false
    }

    getStartingFlag() {
        return this.startingFlag
    }

    resetStartingFlag() {
        this.startingFlag = true
    }

    getTimeInMotion(elapsedTime) {
        return elapsedTime - this.startTime
    }

    getPercentageInMotion (elapsedTime) {
        return (elapsedTime - this.startTime) / GLOBALS.MOVE_TIME_SECS
    }

    /**
     * Returns 
     * 0 if want to rotateX
     * 1 if want to rotateY
     * 2 if want to rotateZ
     */
    getRotationalAxis() {
        return this.rotationAxis
    }

    getMovingRotation(elapsedTime) {
        const timeElapsedSinceLastRotation = elapsedTime - this.previousTimeInMotion
        this.previousTimeInMotion = elapsedTime

        if (timeElapsedSinceLastRotation === 0) {
            return 0
        }
        else {
            return this.rotationAngle * (timeElapsedSinceLastRotation / GLOBALS.MOVE_TIME_SECS)
        }
    }

    getNEWMovingRotation (elapsedTime) {
        const gradient = BezierQuadraticDerivativeThreeDim(this.bezierQuadraticPoints, this.getPercentageInMotion(elapsedTime))
        return addArrays(this.getMovingPosition(elapsedTime), gradient)
    }

    getMovingPosition(elapsedTime) {
        const timeInMotion = elapsedTime - this.startTime
        return BezierQuadraticThreeDim(this.bezierQuadraticPoints, (timeInMotion / GLOBALS.MOVE_TIME_SECS))
    }
}