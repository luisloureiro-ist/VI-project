import Component from './component.js'
import RadarChart from '../idioms/radar_chart/index.js'

class NumberOfCompanies extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, {
      width: document.querySelector(parentSelector).offsetWidth,
      height: document.querySelector(parentSelector).offsetHeight - 51 // The height+margin of the title
    })
    this.chart = null
    this.categories = {
      'Mining and quarrying': 'Mining',
      Construction: 'Construction',
      'Human health and social work activities': 'Health',
      'Agriculture, farming, hunting, forestry and fishing': 'Agriculture',
      Manufacturing: 'Manufacturing'
    }

    dispatch.on('initialize.number_of_companies', this.initialize.bind(this))
    dispatch.on(
      'update_municipality.number_of_companies',
      this.update.bind(this)
    )
    dispatch.on('update_years.number_of_companies', this.updateYears.bind(this))
  }

  initialize ({ companiesData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    super.setYears(getYears(data))

    this.chart = new RadarChart(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height,
      sector => super.getDispatch().call('activity_sector_selected', this, sector),
      () => super.getDispatch().call('activity_sector_deselected')
    )

    const reducedData = this.__transformData(data)

    this.chart.create(
      reducedData,
      super.getYears(),
      generateTitleFunction(super.getYears())
    )
  }

  update ({ companiesData: newData }, newMunicipality) {
    super.setMunicipality(newMunicipality)
    super.setDataset(newData)

    const reducedNewData = this.__transformData(newData)

    this.chart.updateData(reducedNewData)
  }

  updateYears (newYears) {
    super.setYears(newYears)

    const reducedData = this.__transformData(super.getDataset())

    this.chart.updateData(
      reducedData,
      super.getYears(),
      generateTitleFunction(super.getYears())
    )
  }

  // Private/auxiliar functions
  __transformData (data) {
    return data
      .filter(d => super.getYears().indexOf(d.year) !== -1)
      .reduce((prev, curr) => {
        const idx = prev.findIndex(ax => this.categories[curr.type] === ax.axis)
        if (idx === -1) {
          return prev.concat({
            axis: this.categories[curr.type],
            value: curr.number
          })
        } else {
          prev[idx].value += curr.number
          return prev
        }
      }, [])
      .map(axis =>
        Object.assign({}, axis, {
          value: Math.ceil(axis.value / super.getYears().length)
        })
      )
  }
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
