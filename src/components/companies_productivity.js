import * as d3 from 'd3'

import Component from './component'
import DivergentBarChart from '../idioms/divergent_bar'

class CompaniesProductivity extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)
    this.activitySectors = []
    this.charts = []

    dispatch.on('initialize', this.initialize.bind(this))
    dispatch.on('update_municipality', this.update.bind(this))
    dispatch.on('update_years', this.updateYears.bind(this))
  }

  initialize (data, municipality) {
    super.setMunicipality(municipality)
    super.setYears(getYears(data))
    super.setDataset(data)
    this.activitySectors = getActivitySectors(data)

    this.updateSectionTitle()

    const chartWidth =
      Math.floor(super.getComponentSize() / this.activitySectors.length) - 5

    this.activitySectors.forEach((activitySector, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === activitySector)
        .sort((first, second) => second.year - first.year)
        .reduce((prev, curr) => prev.concat(curr.productivity), [])

      this.charts.push(
        new DivergentBarChart(
          super.getContainerSelector(),
          chartWidth,
          idx === 0
        )
      )
      this.charts[idx].create(filteredData, idx === 0 ? super.getYears() : null)
    })
  }

  update (newData, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    this.updateSectionTitle()

    this.activitySectors.forEach((activitySector, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === activitySector)
        .sort((first, second) => second.year - first.year)
        .reduce((prev, curr) => prev.concat(curr.productivity), [])

      this.charts[idx].update(filteredData, idx === 0 ? super.getYears() : null)
    })
  }

  updateYears (datesRange) {
    super.setYears(datesRange)

    this.activitySectors.forEach((activitySector, idx) => {
      const filteredData = super
        .getDataset()
        .filter(
          d =>
            d.type === activitySector && super.getYears().indexOf(d.year) !== -1
        )
        .sort((first, second) => second.year - first.year)
        .reduce((prev, curr) => prev.concat(curr.productivity), [])

      this.charts[idx].update(filteredData, idx === 0 ? super.getYears() : null)
    })
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.productivity-title')
      .text(`Productivity of companies in ${super.getMunicipality()}`)
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
