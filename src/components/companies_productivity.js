import Component from './component.js'
import DivergentBarChart from '../idioms/divergent_bar/index.js'

class CompaniesProductivity extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)
    this.activitySectors = []
    this.charts = []
    this.smallActivitySectorsNames = [
      'Agriculture',
      'Mining',
      'Manufactoring',
      'Contruction',
      'Health'
    ]

    dispatch.on('initialize.companies_productivity', this.initialize.bind(this))
    dispatch.on(
      'update_municipality.companies_productivity',
      this.update.bind(this)
    )
    dispatch.on(
      'update_years.companies_productivity',
      this.updateYears.bind(this)
    )
  }

  initialize ({ companiesData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setYears(getYears(data))
    super.setDataset(data)
    this.activitySectors = getActivitySectors(data)

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
      this.charts[idx].create(
        filteredData,
        idx === 0 ? super.getYears() : null,
        this.smallActivitySectorsNames[idx]
      )
    })
  }

  update ({ companiesData: newData }, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

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
