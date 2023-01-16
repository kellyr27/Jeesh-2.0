/**
 * Panel
 */
const canvas2 = document.getElementById('panel')
const ctx = canvas2.getContext('2d')

class SelectionPanel {
    /**
     * 
     */
    panelSplit = [0.15, 0.25, 0.2, 0.25, 0.15]
    panelSplitCumulative = this.panelSplit.map((sum => value => sum += value)(0))

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

    constructor(canvas, initialLegalMoves) {
        this.canvas = canvas
        this.currentDirections = this.setInitialCurrentDirections()
        this.scrollTilePositions = this.setScrollTilePositions()
        this.currentHoveredTitle = [-1, -1, -1]
        this.legalMoves = initialLegalMoves
        this.currentSoldierNum = 0

        this.createSelectionPanel()
    }

    /**
     * Draws Path2D object onto canvas
     */
    #drawTile(co1, co2, co3, co4, color, isBlocked) {
        let scroll = new Path2D()
        scroll.blocked = isBlocked
        scroll.moveTo(co1[0], co1[1])
        scroll.lineTo(co2[0], co2[1])
        scroll.lineTo(co3[0], co3[1])
        scroll.lineTo(co4[0], co4[1])
        scroll.closePath()
        ctx.fillStyle = color
        ctx.strokeStyle = 'black'

        ctx.stroke(scroll)
        ctx.fill(scroll)

        return scroll
    }

    /**
     * Draw the four scroll tiles
     */
    drawScrollTiles() {
        const scrollTiles = []

        for (let scrollTilePosition in this.scrollTilePositions) {

            const scroll = this.#drawTile(
                this.scrollTilePositions[scrollTilePosition][0],
                this.scrollTilePositions[scrollTilePosition][1],
                this.scrollTilePositions[scrollTilePosition][2],
                this.scrollTilePositions[scrollTilePosition][3],
                this.tileColorPalette['scroll']['default'],
                false
            )
            scrollTiles.push(scroll)
        }

        return scrollTiles
    }

    createSelectionPanel() {
        this.scrollTiles = this.drawScrollTiles()
    }


    /**
     * Set scroll tile positions
     */
    setScrollTilePositions() {
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

    /**
     * Sets the initial directions to Army 1
     */
    setInitialCurrentDirections() {
        return {
            face: '-z',
            up: '+y',
            down: '-y',
            left: '-x',
            right: '+x'
        }
    }

    /**
     * Sets the legal moves for the currently selected Soldier
     */
    setLegalMoves(legalMoves) {
        this.legalMoves = legalMoves
    }

    /**
     * 
     */
}

let testPanel = new SelectionPanel(canvas2, [[[5, 5, 9], [0, 0, -1]], [[5, 4, 9], [0, 0, -1]]])