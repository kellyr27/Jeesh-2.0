import { subtractArrays, addArrays } from '../globals/array';

/**
 * Returns three points to form an Quadratic Bezier Curve from depending on the Current and Future Position
 */
export function getSpecializedMidPoint(p1, p2) {
    return [
        p1[0],
        addArrays(subtractArrays(subtractArrays(p2[0], p1[0]), p2[1]), p1[0]),
        p2[0]
    ]
}

/**
 * Using De Casteljaus Algorithm to calculate the Quadratic Bezier Curve.
 * Returns the value at point t where t is a value [0, 1] that represents the percentage along the curve 
 */
function mix(a, b, t) {
    return a * (1 - t) + b*t;
}
 
function BezierQuadratic (A, B, C, t)
{
    // degree 2
    const AB = mix(A, B, t);
    const BC = mix(B, C, t);
    return mix(AB, BC, t);
}

export function BezierQuadraticThreeDim ([A, B, C], t) {
    const x = BezierQuadratic(A[0], B[0], C[0], t)
    const y = BezierQuadratic(A[1], B[1], C[1], t)
    const z = BezierQuadratic(A[2], B[2], C[2], t)
    return [x,y,z]
}

/**
 * Returns the Gradient at point t along the Bezier Curve
 */
function BezierQuadraticDerivative (A, B, C, t) {
    return 2* (1 - t) * (B - A) + 2 * t * (C - B)
}

export function BezierQuadraticDerivativeThreeDim([A, B, C], t) {
    const x = BezierQuadraticDerivative(A[0], B[0], C[0], t)
    const y = BezierQuadraticDerivative(A[1], B[1], C[1], t)
    const z = BezierQuadraticDerivative(A[2], B[2], C[2], t)
    return [x,y,z]
}