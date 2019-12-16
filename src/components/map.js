import Component from './component.js'
import ChoroplethMap from '../idioms/choropleth_map/index.js'

class Map extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector)

    dispatch.on('initialize.map', this.initialize.bind(this))
    dispatch.on('update_municipality.map', this.update.bind(this))
    dispatch.on('update_years.map', this.updateYears.bind(this))
  }

  initialize ({ firesData: data }, municipality, years) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    super.setYears(years)

    this.updateSectionTitle()

    const filteredData = super
      .getDataset()
      .filter(
        datum => datum.nuts === 'NUTS III' && years.indexOf(datum.year) !== -1
      )
    const transformedData = transformData(filteredData)

    this.chart = new ChoroplethMap(super.getContainerSelector())
    this.chart.create(
      transformedData,
      this.__dispatchUpdateMunicipality.bind(this),
      () =>
        `Average number of fires per year between ${years[0]} and ${
          years[years.length - 1]
        }:`
    )
  }

  update ({ firesData: data }, newMunicipality) {
    super.setMunicipality(newMunicipality)
    super.setDataset(data)

    this.updateSectionTitle()
  }

  updateYears (years) {
    super.setYears(years)

    const filteredData = super
      .getDataset()
      .filter(
        datum => datum.nuts === 'NUTS III' && years.indexOf(datum.year) !== -1
      )
    const transformedData = transformData(filteredData)

    this.chart.update(
      transformedData,
      () =>
        `Average number of fires per year between ${years[0]} and ${
          years[years.length - 1]
        }:`
    )
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.title')
      .text(`Selected region: ${super.getMunicipality()}`)
  }

  __dispatchUpdateMunicipality (nuts, name) {
    super.getDispatch().call('region_selected', this, nuts, name)
  }
}

function transformData (data) {
  // Reduce the number of properties to the ones we need
  return (
    data
      .map(datum => ({
        fires: datum.fires,
        year: datum.year,
        location: datum.location,
        nuts: datum.nuts
      }))
      // Sum the number of fires for all years
      .reduce((prev, curr) => {
        const idx = prev.findIndex(
          el => el.location === curr.location && el.nuts === curr.nuts
        )

        if (idx === -1) {
          prev = prev.concat(Object.assign({ years: 1 }, curr))
        } else {
          prev[idx].fires += curr.fires
          prev[idx].years += 1
        }

        return prev
      }, [])
      // Transform the data to the format we want
      .map(datum => ({
        value: Math.ceil(datum.fires / datum.years),
        location: datum.location,
        nuts: datum.nuts
      }))
  )
}

export default Map
