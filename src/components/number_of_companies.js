import Component from './component.js'
import RadarChart from '../idioms/radar_chart/index.js'

class NumberOfCompanies extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, {
      width: document.querySelector(parentSelector).offsetWidth,
      height: document.querySelector(parentSelector).offsetHeight - 51 // The height+margin of the title
    })
    this.chart = null
    this.activitySectors = []
    this.smallActivitySectorsNames = [
      'Agriculture',
      'Mining',
      'Manufactoring',
      'Contruction',
      'Health'
    ]

    dispatch.on('initialize.number_of_companies', this.initialize.bind(this))
    dispatch.on(
      'update_municipality.number_of_companies',
      this.update.bind(this)
    )
  }

  initialize ({ companiesData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    this.activitySectors = getActivitySectors(data)

    this.updateSectionTitle()

    this.chart = new RadarChart(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height
    )

    const years = getYears(data)

    const reducedData = data
      .reduce((prev, curr) => {
        const idx = prev.findIndex(ax => curr.type === ax.axis)
        if (idx === -1) {
          return prev.concat({ axis: curr.type, value: curr.number })
        } else {
          prev[idx].value += curr.number
          return prev
        }
      }, [])
      .map(axis =>
        Object.assign({}, axis, { value: Math.ceil(axis.value / years.length) })
      )

    this.chart.create(reducedData, years, generateTitleFunction(years))
  }

  update ({ companiesData: newData }, newMunicipality) {
    super.setMunicipality(newMunicipality)
    super.setDataset(newData)

    this.updateSectionTitle()

    const years = getYears(newData)

    const reducedNewData = newData
      .reduce((prev, curr) => {
        const idx = prev.findIndex(ax => curr.type === ax.axis)
        if (idx === -1) {
          return prev.concat({ axis: curr.type, value: curr.number })
        } else {
          prev[idx].value += curr.number
          return prev
        }
      }, [])
      .map(axis =>
        Object.assign({}, axis, { value: Math.ceil(axis.value / years.length) })
      )

    this.chart.updateData(reducedNewData, generateTitleFunction(years))
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.title')
      .text(`Number of Companies in ${super.getMunicipality()}`)
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

function generateTitleFunction (years) {
  return (type, result) =>
    `Average number of "${type}" companies per year\n\nBetween ${
      years[0]
    } and ${years[years.length - 1]}: ${result}`
}

export default NumberOfCompanies
