/**
 * Returns a random subarray from an array
 */
export function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

/**
 * Checks if two arrays are equal
 */
export function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}

/**
 * Checks if an array is contained in an Array of arrays.
 */
export function arrayInArray(checkArr, arrOfArrs) {
    for (const arr of arrOfArrs) {
        if (arrayEquals(arr, checkArr)) {
            return true
        }
    }
    return false
}

/**
 * Adds arrays together (A + B) and returns the sum
 */
export function addArrays(a, b) {
    
    if (a.length !== b.length) {
        return console.error(`Array ${a} and Array ${b} are of different length. They cannot be added.`)
    }

    return a.map((el, index) => {
        return el + b[index]
    })
}

/**
 * Returns the resulting array from A - B
 */
export function subtractArrays(a, b) {
    
    if (a.length !== b.length) {
        return console.error(`Array ${a} and Array ${b} are of different length. They cannot be subtracted.`)
    }

    return a.map((el, index) => {
        return el - b[index]
    })
}