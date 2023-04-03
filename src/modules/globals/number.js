/**
 * Checks if an number is between two digits [MIN, MAX)
 */
export function isNumBetween(num, min, max) {
    if ((num < min) || (num >= max)) {
        return false
    }
    else {
        return true
    }
}

/**
 * Generates a random integer between 0 and MAX [0, MAX)
 */
export function generateRandomInt(max) {
    return Math.floor(Math.random() * max)
}
