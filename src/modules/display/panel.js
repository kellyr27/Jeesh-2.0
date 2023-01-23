/**
 * Selection Panel 
 * Used to select what the next move will be played for Human Player 1
 * 
 * TERMINOLOGY
 * - SELECTION TILE - Used to select the coordinate for the next move. All tiles are facing the same direction
 * - SCROLL TILE - Used to move between directions for displaying coordinates
 */

import { arrayEquals, arrayInArray } from "../globals.js"

/**
 * Adds coordinates together and returns the sum
 */
function addCoordinates(...coords) {
    let sum = [0, 0, 0]
    for (let coord of coords) {
        sum[0] += coord[0]
        sum[1] += coord[1]
        sum[2] += coord[2]
    }
    return sum
}

/**
 * Inverse the direction.
 * For example +z becomes -z
 */
function inverseDirection(direction) {
    let inverse = [0, 0, 0]
    for (let i = 0; i < direction.length; i++) {
        inverse[i] += (- direction[i])
    }
    return inverse
}

class Tile {

    constructor(ctx, color, edges, relativeAxis) {
        this.ctx = ctx
        this.color = color
        this.edges = edges

        // For Selection Tiles only
        if (relativeAxis !== undefined) {
            this.relativeAxis = relativeAxis
        }
    }

    #createPath () {
        let path = new Path2D()

        path.moveTo(this.edges[0][0], this.edges[0][1])
        for (const edge of this.edges.slice(1)) {
            path.lineTo(edge[0], edge[1])
        }
        path.closePath()

        return path
    }

    drawTile() {
        this.path = this.#createPath()

        this.ctx.fillStyle = this.color
        this.ctx.strokeStyle = 'black'

        this.ctx.stroke(this.path)
        this.ctx.fill(this.path)

    }

    getPath () {
        return this.path
    }

    setColor(color) {
        this.color = color
    }

    getRelativeAxis() {
        return this.relativeAxis
    }
}

export default class SelectionPanel {

    /**
     * Percentage splits for the tiling of the Selection Panel
     */
    panelSplit = [0.15, 0.25, 0.2, 0.25, 0.15]
    panelSplitCumulative = this.panelSplit.map((sum => value => sum += value)(0))

    tileColorPalette = {
        scroll: {
            default: 'purple',
            hovered: 'magenta',
            selected: 'green',
            blocked: 'grey'
        },
        selection: {
            default: 'red',
            hovered: 'maroon',
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

        this.scrollTileCoordinates = this.createScrollTileCoordinates()
        this.#setCurrentDirectionsDefault()

        this.currentTiles = {
            scroll: {
                hovered: -1,
                selected: -1
            },
            selection: {
                hovered: -1,
                selected: -1
            }
        }

        this.scrollTiles = this.#createScrollTiles()
        this.selectionTiles = this.#createSelectionTiles()

        this.drawPanel()
    }

    #setCurrentDirectionsDefault () {
        this.currentDirections = {
            face: [0, 0, -1],
            up: [0, 1, 0],
            down: [0, -1, 0],
            left: [-1, 0, 0],
            right: [1, 0, 0]
        }
    }

    setCurrentScrollHovered (index) {
        this.currentTiles.scroll.hovered = index
    }

    setCurrentScrollSelected (index) {
        this.currentTiles.scroll.selected = index
        this.updateDirections(index)
    }

    setCurrentSelectionHovered (index) {
        this.currentTiles.selection.hovered = index
    }

    setCurrentSelectionSelected (index) {
        this.currentTiles.selection.selected = index
    }

    resetCurrentScrollHovered () {
        this.currentTiles.scroll.hovered = -1
    }

    resetCurrentScrollSelected () {
        this.currentTiles.scroll.selected = -1
    }

    resetCurrentSelectionHovered () {
        this.currentTiles.selection.hovered = -1
    }

    resetCurrentSelectionSelected () {
        this.currentTiles.selection.selected = -1
    }

    /**
     * 
     */

    drawPanel() {
        this.updateScrollTiles()
        this.updateSelectionTiles()
        this.drawScrollTiles()
        this.drawSelectionTiles()
        this.drawText()
    }

    /**
     * When a scroll tile has been clicked
     *      0 - up
     *      1 - left
     *      2 - down
     *      3 - right
     * 
     */
    updateDirections(scrollTilesNum) {
        if (scrollTilesNum === 0) {
            let tempFace = structuredClone(this.currentDirections.face)
            this.currentDirections.face = this.currentDirections.up
            this.currentDirections.up = inverseDirection(tempFace)
            this.currentDirections.down = tempFace
        }
        else if (scrollTilesNum === 1) {
            let tempFace = structuredClone(this.currentDirections.face)
            this.currentDirections.face = this.currentDirections.left
            this.currentDirections.left = inverseDirection(tempFace)
            this.currentDirections.right = tempFace
        }
        else if (scrollTilesNum === 2) {
            let tempFace = structuredClone(this.currentDirections.face)
            this.currentDirections.face = this.currentDirections.down
            this.currentDirections.down = inverseDirection(tempFace)
            this.currentDirections.up = tempFace
        }
        else if (scrollTilesNum === 3) {
            let tempFace = structuredClone(this.currentDirections.face)
            this.currentDirections.face = this.currentDirections.right
            this.currentDirections.right = inverseDirection(tempFace)
            this.currentDirections.left = tempFace
        }
    }

    createScrollTileCoordinates() {
        return {
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
    }

    drawScrollTiles() {
        for (const scrollTile of this.scrollTiles) {
            scrollTile.drawTile()
        }
    }

    drawSelectionTiles() {
        for (const selectionTile of this.selectionTiles) {
            selectionTile.drawTile()
        }
    }

    /**
     * 
     */
    updateScrollTiles() {

        for (let i = 0; i < this.scrollTiles.length; i++) {
            
            if (this.currentTiles['scroll']['selected'] === i) {
                this.scrollTiles[i].setColor(this.tileColorPalette['scroll']['selected'])
            }
            else if (this.currentTiles['scroll']['hovered'] === i) {
                this.scrollTiles[i].setColor(this.tileColorPalette['scroll']['hovered'])
            }
            else {
                this.scrollTiles[i].setColor(this.tileColorPalette['scroll']['default'])
            }
        }
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
    getAbsoluteCoordinate(tile) {

        const relativeRow = tile.getRelativeAxis()[0]
        const relativeCol = tile.getRelativeAxis()[1]

        let absCoordinate = addCoordinates(this.currentPosition[0], this.currentDirections['face'])


        if (relativeRow === -1) {
            absCoordinate = addCoordinates(absCoordinate, this.currentDirections['left'])
        }
        else if (relativeRow === 1) {
            absCoordinate = addCoordinates(absCoordinate, this.currentDirections['right'])
        }

        if (relativeCol === -1) {
            absCoordinate = addCoordinates(absCoordinate, this.currentDirections['up'])
        }
        else if (relativeCol === 1) {
            absCoordinate = addCoordinates(absCoordinate, this.currentDirections['down'])
        }

        return absCoordinate

    }

    /**
     * 
     */
    updateSelectionTiles() {
        const faceSelectionCoordinates = this.#getCurrentFaceCoordinates()

        for (let i = 0; i < this.selectionTiles.length; i++) {
            // If the tile is not a possible Move
            if (!arrayInArray(this.getAbsoluteCoordinate(this.selectionTiles[i]), faceSelectionCoordinates)) {
                this.selectionTiles[i].setColor(this.tileColorPalette['selection']['blocked'])
            }
            else if (this.currentTiles['selection']['selected'] === i) {
                this.selectionTiles[i].setColor(this.tileColorPalette['selection']['selected'])
            }
            else if (this.currentTiles['selection']['hovered'] === i) {
                this.selectionTiles[i].setColor(this.tileColorPalette['selection']['hovered'])
            }
            else {
                this.selectionTiles[i].setColor(this.tileColorPalette['selection']['default'])
            }
        }
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
                    this.tileColorPalette['selection']['default'],
                    [
                        [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height],
                        [this.panelSplitCumulative[i + 1] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                        [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 2] * this.canvas.height],
                        [this.panelSplitCumulative[i + 2] * this.canvas.width, this.panelSplitCumulative[j + 1] * this.canvas.height]
                    ],
                    [i, j]
                )
                selectionTiles.push(tile)
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
    setSoldier(currentPosition, legalMoves) {
        this.currentPosition = currentPosition
        this.legalMoves = legalMoves
        this.#setCurrentDirectionsDefault()
        this.drawPanel()
    }

    getScrollTilePaths () {
        return this.scrollTiles.map((tile) => {
            return tile.getPath()
        })
    }

    getSelectionTilePaths () {
        return this.selectionTiles.map((tile) => {
            return tile.getPath()
        })
    }

    /**
     * NOTE: May need to make a deep clone
     */
    getCurrentPosition () {
        return this.currentPosition
    }

    /**
     * 
     */
    getHoveredPosition () {
        const hoveredPosition = this.getAbsoluteCoordinate(this.selectionTiles[this.currentTiles.selection.hovered])
        // Check if the position is a legal move
        if (!arrayInArray(hoveredPosition, this.#getCurrentFaceCoordinates())) {
            return [-1, -1, -1]
        }
        else {
            return hoveredPosition
        }
    }

}