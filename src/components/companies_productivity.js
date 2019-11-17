import Component from './component'
import DivergentBarChart from '../idioms/divergent_bar'

class CompaniesProductivity extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)
    this.activitySectors = []

    dispatch.on('initialize', this.initialize.bind(this))
  }

  initialize (data, municipality) {
    super.setMunicipality(municipality)
    super.setYears(getYears(data))
    super.setDataset(data)
    this.activitySectors = getActivitySectors(data)

    const chartWidth =
      Math.floor(super.getComponentSize() / this.activitySectors.length) - 4

    this.activitySectors.forEach((activitySector, idx) => {
      const filteredData = super.getDataset()
        .filter(d => d.type === activitySector)
        .reduce((prev, curr) => prev.concat(curr.productivity), [])

      new DivergentBarChart(
        super.getContainerSelector(),
        chartWidth,
        idx === 0
      ).create(filteredData, idx === 0 ? super.getYears() : null)
    })
  }
}

function getActivitySectors (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.type) === -1 ? prev.concat([curr.type]) : prev,
    []
  )
}

function getYears (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.year) === -1 ? prev.concat([curr.year]) : prev,
    []
  )
}

export default CompaniesProductivity
