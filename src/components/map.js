import Component from './component.js'
import ChoroplethMap from '../idioms/choropleth_map/index.js'

class Map extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)

    dispatch.on('initialize.map', this.initialize.bind(this))
  }

  initialize ({ firesData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    super.setYears(getYears(data))

    this.updateSectionTitle()

    this.chart = new ChoroplethMap(
      super.getContainerSelector()
    )
    this.chart.create()
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.region-name')
      .text(`${super.getMunicipality()}`)
  }
}

function getYears (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.year) === -1 ? prev.concat([curr.year]) : prev,
    []
  )
}

export default Map
