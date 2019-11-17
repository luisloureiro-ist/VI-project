class Component {
  constructor (dispatch, containerSelector, componentSize) {
    this.dispatch = dispatch
    this.containerSelector = containerSelector
    this.componentSize = componentSize
    this.years = []
    this.municipality = ''
  }

  getContainerSelector () {
    return this.containerSelector
  }

  getComponentSize () {
    return this.componentSize
  }

  getYears () {
    return this.years
  }

  setYears (newYears = []) {
    this.years = newYears
  }

  getMunicipality () {
    return this.municipality
  }

  setMunicipality (newMunicipality) {
    this.municipality = newMunicipality
  }
}

export default Component
