import Component from './component'
import ClevelandDotPlot from '../idioms/cleveland_dot_plots'

class Elections extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)
    this.electionTypes = []
    this.charts = []

    // dispatch.on('initialize', this.initialize.bind(this))
    // dispatch.on('update_municipality', this.update.bind(this))
  }

  initialize (data, municipality) {
    super.setMunicipality(municipality)
    // super.setYears(getYears(data))
    super.setDataset(data)
    this.electionTypes = getElectionTypes(data)

    const chartWidth =
      Math.floor(super.getComponentSize() / this.electionTypes.length) - 5

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)
        // .sort((first, second) => second.year - first.year)
        .reduce((prev, curr) => prev.concat(curr.electionResults), [])

      this.charts.push(
        new ClevelandDotPlot(
          super.getContainerSelector(),
          chartWidth,
          idx === 0
        )
      )
      this.charts[idx].create(filteredData, idx === 0 ? getParties() : null)
    })
  }

  update (newData, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)
        .reduce((prev, curr) => prev.concat(curr.electionResults), [])

      this.charts[idx].update(filteredData, idx === 0 ? this.getParties() : null)
    })
  }
}

function getElectionTypes (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.type) === -1 ? prev.concat([curr.type]) : prev,
    []
  )
}

function getParties (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.party) === -1 ? prev.concat([curr.party]) : prev,
    []
  )
}

export default Elections
