import Component from './component.js'
import MultiLinesChart from '../idioms/multi_lines_chart/index.js'

class FiresFirefighters extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, {
      width: document.querySelector(parentSelector).offsetWidth,
      height: document.querySelector(parentSelector).offsetHeight - 51
    })

    dispatch.on('initialize.fires_firefighters', this.initialize.bind(this))
    dispatch.on(
      'update_municipality.fires_firefighters',
      this.updateLocation.bind(this)
    )
    dispatch.on('update_years.fires_firefighters', this.updateYears.bind(this))
  }

  initialize ({ firesData: data }, municipality, years) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    super.setYears(years)

    this.chart = new MultiLinesChart(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height
    )

    const categories = [
      {
        label: 'Fires',
        color: 'orange'
      },
      {
        label: 'Firefighters',
        color: 'red'
      }
    ]

    const filteredData = data.filter(
      d => d.location === municipality.name && d.nuts === municipality.nuts && super.getYears().indexOf(d.year) !== -1
    )
    this.chart.create(
      getValues(filteredData),
      years,
      categories
    )
  }

  updateLocation ({ firesData: newData }, newMunicipality) {
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

export default FiresFirefighters
