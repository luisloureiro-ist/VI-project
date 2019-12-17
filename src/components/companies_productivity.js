import Component from './component.js'
import MultiLinesChartProductivity from '../idioms/multi_lines_chart_productivity/index.js'

class CompaniesProductivity extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, {
      width: document.querySelector(parentSelector).offsetWidth,
      height: document.querySelector(parentSelector).offsetHeight - 51
    })

    dispatch.on('initialize.companies_productivity', this.initialize.bind(this))
    dispatch.on(
      'update_municipality.companies_productivity',
      this.updateLocation.bind(this)
    )
    dispatch.on('update_years.companies_productivity', this.updateYears.bind(this))
  }

  initialize ({ companiesData: data }, municipality, years) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    super.setYears(years)

    this.chart = new MultiLinesChartProductivity(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height
    )

    const activitySectors = [
      { text: 'Mining' },
      { text: 'Construction' },
      { text: 'Health' },
      { text: 'Manufacturing' },
      { text: 'Agriculture' }
    ]

    const filteredData = data.filter(
      d => d.location === municipality.name && d.nuts === municipality.nuts && super.getYears().indexOf(d.year) !== -1
    )
    this.chart.create(
      getValues(filteredData),
      years,
      activitySectors
    )
  }

  updateLocation ({ companiesData: newData }, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    const filteredNewData = newData.filter(
      d =>
        d.location === newMunicipality.name && d.nuts === newMunicipality.nuts)

    const filteredNewData2 = newData.filter(
      d =>
        d.location === newMunicipality.name && d.nuts === newMunicipality.nuts && super.getYears().indexOf(d.year) !== -1)
    this.chart.update(getValues(filteredNewData), getValues(filteredNewData2), super.getYears())
  }

  updateYears (newYears) {
    super.setYears(newYears)

    const filteredNewData = super.getDataset().filter(d => d.location === super.getMunicipality().name)
    const municipality = filteredNewData.filter(d => d.nuts === super.getMunicipality().nuts)

    const yearsFilter = municipality.filter(d => super.getYears().indexOf(d.year) !== -1)
    this.chart.updateYears(getValues(yearsFilter), newYears)
  }
}

function getValues (data) {
  return data.reduce(
    (prev, curr) => {
      prev[0].push(curr.fires)
      prev[1].push(curr.firefighters)
      return prev
    },
    [[], []]
  )
}

export default CompaniesProductivity
