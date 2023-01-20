

export default class UserRaycaster {
    constructor () {
        this.hoveredSoldier = -1
        this.selectedSoldier = -1
    }

    getHoveredSoldier () {
        return this.hoveredSoldier
    }

    getSelectedSoldier () {
        return this.selectedSoldier
    }

    isHoveredSoldier () {
        if (this.hoveredSoldier !== -1) {
            return true
        }
        else {
            return false
        }
    }

    isSelectedSoldier () {
        if (this.selectedSoldier !== -1) {
            return true
        }
        else {
            return false
        }
    }

    setHoveredSoldier (index) {
        this.hoveredSoldier = index
    }

    setSelectedSoldier (index) {
        this.selectedSoldier = index
    }

    resetHoveredSoldier () {
        this.hoveredSoldier = -1
    }

    resetSelectedSoldier () {
        this.selectedSoldier = -1
    }
}