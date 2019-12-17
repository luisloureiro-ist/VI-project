import Component from './component.js'
import MultiLinesChart from '../idioms/multi_lines_chart/index.js'

class CompaniesProductivity extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, {
      width: document.querySelector(parentSelector).offsetWidth,
      height: document.querySelector(parentSelector).offsetHeight - 51
    })
    this.totalYears = []

    this.colors = d3.schemeTableau10
    this.categories = [
      {
        label: 'Mining',
        fullname: 'Mining and quarrying',
        color: this.colors[0]
      },
      {
        label: 'Construction',
        fullname: 'Construction',
        color: this.colors[1]
      },
      {
        label: 'Health',
        fullname: 'Human health and social work activities',
        color: this.colors[2]
      },
      {
        label: 'Agriculture',
        fullname: 'Agriculture, farming, hunting, forestry and fishing',
        color: this.colors[3]
      },
      {
        label: 'Manufacturing',
        fullname: 'Manufacturing',
        color: this.colors[4]
      }
    ]

    dispatch.on('initialize.companies_productivity', this.initialize.bind(this))
    dispatch.on(
      'update_municipality.companies_productivity',
      this.updateLocation.bind(this)
    )
    dispatch.on(
      'update_years.companies_productivity',
      this.updateYears.bind(this)
    )
  }

  initialize ({ companiesData: data }, municipality, years) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    super.setYears(years)
    this.totalYears = years

    this.chart = new MultiLinesChart(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height
    )

    const filteredData = this.__filterData(data, super.getYears())
    const transformedData = this.__transformData(filteredData, super.getYears())
    this.chart.create(
      getValues(transformedData, this.categories),
      years,
      this.categories,
      'Euros (€) per worker per year in:',
      (value, label, year) =>
        `${d3.format('.2f')(value)}€ per worker in "${label}" in ${year}`
    )
  }

  updateLocation ({ companiesData: newData }, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    const filteredNewDataStatic = this.__filterData(newData, this.totalYears)
    const filteredNewDataDynamic = this.__filterData(newData, super.getYears())
    const transformedNewDataStatic = this.__transformData(
      filteredNewDataStatic,
      this.totalYears
    )
    const transformedNewDataDynamic = this.__transformData(
      filteredNewDataDynamic,
      super.getYears()
    )

    this.chart.update(
      getValues(transformedNewDataStatic, this.categories),
      getValues(transformedNewDataDynamic, this.categories),
      super.getYears(),
      (value, label, year) =>
        `${d3.format('.2f')(value)}€ per worker in "${label}" in ${year}`
    )
  }

  updateYears (newYears) {
    super.setYears(newYears)

    const filteredData = this.__filterData(super.getDataset(), super.getYears())
    const transformedData = this.__transformData(filteredData, super.getYears())

    this.chart.updateYears(
      getValues(transformedData, this.categories),
      newYears,
      (value, label, year) =>
        `${d3.format('.2f')(value)}€ per worker in "${label}" in ${year}`
    )
  }

  __filterData (data, years) {
    return data.filter(
      d =>
        d.location === super.getMunicipality().name &&
        d.nuts === super.getMunicipality().nuts &&
        years.indexOf(d.year) !== -1
    )
  }

  __transformData (data, years) {
    return data.reduce((prev, curr) => {
      const ret = prev.concat()
      let idx = years.indexOf(curr.year)
      if (!ret[idx]) {
        // if there's no array for this year ...
        idx = ret.push({ year: curr.year }) - 1 // -1 because push returns the new length and not the "new" idx
      }

      ret[idx][curr.type] = curr.productivity

      return ret
    }, [])
  }
}

function getValues (data, categories) {
  return data.reduce(
    (prev, curr) => {
      const ret = prev.concat()
      ret[0].push(curr[categories[0].fullname])
      ret[1].push(curr[categories[1].fullname])
      ret[2].push(curr[categories[2].fullname])
      ret[3].push(curr[categories[3].fullname])
      ret[4].push(curr[categories[4].fullname])
      return ret
    },
    [[], [], [], [], []]
  )
}

export default CompaniesProductivity
