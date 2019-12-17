import Component from './component.js'
import MultiLinesChart from '../idioms/multi_lines_chart/index.js'

class CompaniesProductivity extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, {
      width: document.querySelector(parentSelector).offsetWidth,
      height: document.querySelector(parentSelector).offsetHeight - 51
    })

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

    this.chart = new MultiLinesChart(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height
    )

    const filteredData = data.filter(
      d =>
        d.location === municipality.name &&
        d.nuts === municipality.nuts &&
        super.getYears().indexOf(d.year) !== -1
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
    this.chart.create(
      getValues(transformedData, this.categories),
      years,
      this.categories
    )
  }

  updateLocation ({ companiesData: newData }, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    const filteredNewDataStatic = newData.filter(
      d =>
        d.location === newMunicipality.name && d.nuts === newMunicipality.nuts
    )
    const filteredNewDataDynamic = filteredNewDataStatic.filter(
      d => super.getYears().indexOf(d.year) !== -1
    )
    const transformedNewDataStatic = filteredNewDataStatic.reduce(
      (prev, curr) => {
        const ret = prev.concat()
        const idx = super.getYears().indexOf(curr.year)
        if (!ret[idx]) {
          // if there's no array for this year ...
          ret.splice(idx, 0, { year: curr.year })
        }

        ret[idx][curr.type] = curr.productivity

        return ret
      },
      []
    )
    const transformedNewDataDynamic = filteredNewDataDynamic.reduce(
      (prev, curr) => {
        const ret = prev.concat()
        const idx = super.getYears().indexOf(curr.year)
        if (!ret[idx]) {
          // if there's no array for this year ...
          ret.splice(idx, 0, { year: curr.year })
        }

        ret[idx][curr.type] = curr.productivity

        return ret
      },
      []
    )

    this.chart.update(
      getValues(transformedNewDataStatic, this.categories),
      getValues(transformedNewDataDynamic, this.categories),
      super.getYears()
    )
  }

  updateYears (newYears) {
    super.setYears(newYears)

    const filteredData = super
      .getDataset()
      .filter(
        d =>
          d.location === super.getMunicipality().name &&
          d.nuts === super.getMunicipality().nuts &&
          super.getYears().indexOf(d.year) !== -1
      )

    const transformedData = filteredData.reduce((prev, curr) => {
      const ret = prev.concat()
      const idx = super.getYears().indexOf(curr.year)
      if (!ret[idx]) {
        // if there's no array for this year ...
        ret.splice(idx, 0, { year: curr.year })
      }

      ret[idx][curr.type] = curr.productivity

      return ret
    }, [])
    this.chart.updateYears(
      getValues(transformedData, this.categories),
      newYears
    )
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
