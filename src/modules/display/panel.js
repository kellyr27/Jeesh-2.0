/**
 * Selection Panel 
 * Used to select what the next move will be played for Human Player 1
 * 
 * TERMINOLOGY
 * - SELECTION TILE - Used to select the coordinate for the next move. All tiles are facing the same direction
 * - SCROLL TILE - Used to move between directions for displaying coordinates
 */

import { arrayEquals } from "../globals.js"

class Tile {

    constructor(ctx, color, edges, axis1, axis2) {
        this.ctx = ctx
        this.color = color
        this.edges = edges

        // For Selection Tiles only
        if (axis1 === undefined) {
            this.axis1 = axis1
            this.axis2 = axis2
        }
    }

    drawTile() {
        let scroll = new Path2D()

        scroll.moveTo(this.edges[0][0], this.edges[0][1])
        for (const edge of this.edges.slice(1)) {
            scroll.lineTo(edge[0], edge[1])
        }
        scroll.closePath()

        this.ctx.fillStyle = this.color
        this.ctx.strokeStyle = 'black'

        this.ctx.stroke(scroll)
        this.ctx.fill(scroll)

        return scroll
    }

    setColor(color) {
        this.color = color
    }
}

export default class SelectionPanel {

    /**
     * Percentage splits for the tiling of the Selection Panel
     */
    panelSplit = [0.15, 0.25, 0.2, 0.25, 0.15]
    panelSplitCumulative = this.panelSplit.map((sum => value => sum += value)(0))

    scrollTileCoordinates = {
        up: [
            [0, 0],
            [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
            [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
            [this.canvas.width, 0]
        ],
        left: [
            [0, 0],
            [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
            [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
            [0, this.canvas.height]
        ],
        down: [
            [0, this.canvas.height],
            [this.panelSplitCumulative[0] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
            [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
            [this.canvas.width, this.canvas.height]
        ],
        right: [
            [this.canvas.width, this.canvas.height],
            [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[3] * this.canvas.height],
            [this.panelSplitCumulative[3] * this.canvas.width, this.panelSplitCumulative[0] * this.canvas.height],
            [this.canvas.width, 0]
        ]
    }

    tileColorPalette = {
        scroll: {
            default: 'purple',
            hover: 'magenta',
            selected: 'green',
            blocked: 'grey'
        },
        selection: {
            default: 'red',
            hover: 'maroon',
            selected: 'green',
            blocked: 'grey'
        }
    }

    /**
     * NOTE: Current directions is initially set up for Army 1
     */
    constructor(canvas, currentPosition, initialLegalMoves) {
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d')

        this.currentPosition = currentPosition
        this.legalMoves = initialLegalMoves

        this.currentDirections = {
            face: [0, 0, -1],
            up: [0, 1, 0],
            down: [0, -1, 0],
            left: [-1, 0, 0],
            right: [1, 0, 0]
        }

        this.scrollTiles = this.#createScrollTiles()
        this.selectionTiles = this.#createSelectionTiles()
    }

    /**
     * Create the four Scroll Tiles (up, down, left and right)
     */
    #createScrollTiles() {
        const scrollTiles = []

        for (let scrollTileCoord in this.scrollTileCoordinates) {

            const scroll = new Tile(
                this.ctx,
                this.tileColorPalette['scroll']['default'],
                this.scrollTileCoordinates[scrollTileCoord]
            )
            scrollTiles.push(scroll)
        }

        return scrollTiles
    }

    /**
     * From the Legal Moves, get the coordinates from a the current facing direction
     */
    #getCurrentFaceCoordinates() {
        return this.legalMoves
            .filter((el) => {
                return arrayEquals(el[1], this.currentDirections.face)
            })
            .map((el) => {
                return el[0]
            })
    }

    /**
     * 
     */
    getAbsoluteCoordinate() {
        let currentCoordinate = this.currentPosition[0]
        if (this.currentDirections.face[0] !== 0) {
            currentCoordinate = addCoordinates(currentCoordinate, [this.currentDirections.face[0], i, j])
        }
        else if (this.currentDirections.face[1] !== 0) {
            currentCoordinate = addCoordinates(currentCoordinate, [i, this.currentDirections.face[1], j])
        }
        else if (this.currentDirections.face[2] !== 0) {
            currentCoordinate = addCoordinates(currentCoordinate, [i, j, this.currentDirections.face[2]])
        }
    }

    /**
     * 
     */
    updateSelectionTiles() {
        const faceSelectionCoordinates = this.#getCurrentFaceCoordinates()


    }

    /**
     * 
     */
    #createSelectionTiles() {
        const selectionTiles = []

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const tile = new Tile(
                    this.ctx,
                    this.tileColorPalette['selection']['default']
                    [
                    [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height],
                    [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                    [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                    [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height]
                    ],
                    i,
                    j
                )
            }
        }

        return selectionTiles
    }

    /**
     * Draws the Selection Tiles
     */
    drawSelectionTiles() {
        const selectionTiles = []

        const faceSelectionCoordinates = this.#getCurrentFaceCoordinates()

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {

                /**
                 * Determine the co-ordinate of the tile
                 */
                let currentCoordinate = this.currentPosition[0]
                if (this.currentDirections.face[0] !== 0) {
                    currentCoordinate = addCoordinates(currentCoordinate, [this.currentDirections.face[0], i, j])
                }
                else if (this.currentDirections.face[1] !== 0) {
                    currentCoordinate = addCoordinates(currentCoordinate, [i, this.currentDirections.face[1], j])
                }
                else if (this.currentDirections.face[2] !== 0) {
                    currentCoordinate = addCoordinates(currentCoordinate, [i, j, this.currentDirections.face[2]])
                }


                /**
                 * 
                 */
                if (arrayInArray(currentCoordinate, faceSelectionCoordinates)) {
                    const tile = new Tile(
                        this.ctx,
                        this.tileColorPalette['selection']['default'],
                        [
                            [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height],
                            [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                            [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                            [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height]
                        ]
                    )

                    selectionTiles.push(tile)
                }
                else {
                    const tile = this.#drawTile(
                        [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height],
                        [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                        [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                        [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height],
                        this.tileColorPalette['selection']['blocked'],
                        true
                    )
                    selectionTiles.push(tile)
                }
            }
        }

        return selectionTiles
    }

    /**
     * Returns the Display text from a Direction input
     */
    #getDirectionText(direction) {
        if (arrayEquals(direction, [1, 0, 0])) {
            return '+x'
        }
        else if (arrayEquals(direction, [-1, 0, 0])) {
            return '-x'
        }
        else if (arrayEquals(direction, [0, 1, 0])) {
            return '+y'
        }
        else if (arrayEquals(direction, [0, -1, 0])) {
            return '-y'
        }
        else if (arrayEquals(direction, [0, 0, 1])) {
            return '+z'
        }
        else if (arrayEquals(direction, [0, 0, -1])) {
            return '-z'
        }
    }

    /**
     * Draws the Text
     */
    drawText() {
        this.ctx.font = "1em Helvetica"

        const textWidthOffset = (txt) => {
            return this.ctx.measureText(txt).width
        }
        const textHeightOffset = (txt) => {
            const metrics = this.ctx.measureText(txt)
            // const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
            const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            return actualHeight
        }

        this.ctx.strokeText(this.#getDirectionText(this.currentDirections['up']),
            0.5 * this.canvas.width - 0.5 * textWidthOffset(this.#getDirectionText(this.currentDirections['up'])),
            this.panelSplit[0] * 0.5 * this.canvas.height + textHeightOffset(this.#getDirectionText(this.currentDirections['up'])) / 2)
        this.ctx.strokeText(this.#getDirectionText(this.currentDirections['down']),
            0.5 * this.canvas.width - 0.5 * textWidthOffset(this.#getDirectionText(this.currentDirections['down'])),
            (1 - 0.5 * this.panelSplit[4]) * this.canvas.height + textHeightOffset(this.#getDirectionText(this.currentDirections['down'])) / 2)
        this.ctx.strokeText(this.#getDirectionText(this.currentDirections['left']),
            0.5 * this.panelSplit[0] * this.canvas.width - 0.5 * textWidthOffset(this.#getDirectionText(this.currentDirections['left'])),
            0.5 * this.canvas.height + textHeightOffset(this.#getDirectionText(this.currentDirections['left'])) / 2)
        this.ctx.strokeText(this.#getDirectionText(this.currentDirections['right']),
            (1 - 0.5 * this.panelSplit[4]) * this.canvas.width - 0.5 * textWidthOffset(this.#getDirectionText(this.currentDirections['right'])),
            0.5 * this.canvas.height + textHeightOffset(this.#getDirectionText(this.currentDirections['right'])) / 2)
        this.ctx.strokeText(this.#getDirectionText(this.currentDirections['face']),
            0.5 * this.canvas.width - 0.5 * textWidthOffset(this.#getDirectionText(this.currentDirections['face'])),
            0.5 * this.canvas.height + textHeightOffset(this.#getDirectionText(this.currentDirections['face'])) / 2)
    }

    /**
     * Sets the legal moves for the currently selected Soldier
     */
    setLegalMoves(legalMoves) {
        this.legalMoves = legalMoves
    }

}