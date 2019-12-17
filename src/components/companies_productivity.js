import Component from './component.js'
import MultiLinesChart from '../idioms/multi_lines_chart/index.js'

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

    this.chart = new MultiLinesChart(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height
    )

    const colors = d3.schemeTableau10

    const categories = [
      {
        label: 'Mining',
        fullname: 'Mining and quarrying',
        color: colors[0]
      },
      {
        label: 'Construction',
        fullname: 'Construction',
        color: colors[1]
      },
      {
        label: 'Health',
        fullname: 'Human health and social work activities',
        color: colors[2]
      },
      {
        label: 'Agriculture',
        fullname: 'Agriculture, farming, hunting, forestry and fishing',
        color: colors[3]
      },
      {
        label: 'Manufacturing',
        fullname: 'Manufacturing',
        color: colors[4]
      }
    ]

    const filteredData = data.filter(
      d => d.location === municipality.name && d.nuts === municipality.nuts && super.getYears().indexOf(d.year) !== -1
    )
    const transformedData = filteredData.reduce((prev, curr) => {
      const ret = prev.concat()
      const idx = years.indexOf(curr.year)
      if (!ret[idx]) {
        // if there's no array for this year ...
        ret.splice(idx, 0, { year: curr.year })
      }

      ret[idx][curr.type] = curr.productivity

      return ret
    }, [])
    this.chart.create(getValues(transformedData, categories), years, categories)
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
