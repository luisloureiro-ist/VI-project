import Component from './component.js'
import ChoroplethMap from '../idioms/choropleth_map/index.js'

class Map extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)

    dispatch.on('initialize.map', this.initialize.bind(this))
    dispatch.on('update_municipality.map', this.update.bind(this))
    dispatch.on('update_years.map', this.updateYears.bind(this))
  }

  initialize ({ firesData: data }, municipality, years) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    super.setYears(years)

    this.updateSectionTitle()

    const transformedData = transformData(data)
    const filteredData = transformedData.filter(
      datum => datum.nuts === 'NUTS III'
    )

    this.chart = new ChoroplethMap(
      `${super.getContainerSelector()} .map-section`
    )
    this.chart.create(
      filteredData,
      this.__dispatchUpdateMunicipality.bind(this),
      () =>
        `Average number of Fires between ${years[0]} and ${
          years[years.length - 1]
        }`
    )
  }

  update ({ firesData: data }, newMunicipality) {
    super.setMunicipality(newMunicipality)
    super.setDataset(data)

    this.updateSectionTitle()
  }

  updateYears (years) {
    super.setYears(years)

    const transformedData = transformData(super.getDataset())
    const filteredData = transformedData.filter(
      datum => datum.nuts === 'NUTS III'
    )

    this.chart.update(
      filteredData,
      () =>
        `Average number of Fires between ${years[0]} and ${
          years[years.length - 1]
        }`
    )
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.region-name')
      .text(`${super.getMunicipality()}`)
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
