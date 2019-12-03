import Component from './component.js'
import ChoroplethMap from '../idioms/choropleth_map/index.js'

class Map extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)

    dispatch.on('initialize.map', this.initialize.bind(this))
    dispatch.on('update_municipality.map', this.update.bind(this))
  }

  initialize ({ firesData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)

    this.updateSectionTitle()

    this.chart = new ChoroplethMap(super.getContainerSelector())
    this.chart.create(this.__dispatchUpdateMunicipality.bind(this))
  }

  update ({ firesData: data }, newMunicipality) {
    super.setMunicipality(newMunicipality)
    super.setDataset(data)

    this.updateSectionTitle()
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.region-name')
      .text(`${super.getMunicipality()}`)
  }

  __dispatchUpdateMunicipality (NUTS, name) {
    super.getDispatch().call('region_selected', this, NUTS, name)
  }
}

export default Map
