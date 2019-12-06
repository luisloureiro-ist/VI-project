import Component from './component.js'
import MultiLinesChart from '../idioms/multi_lines_chart/index.js'

class FiresFirefighters extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)

    dispatch.on('initialize.fires_firefighters', this.initialize.bind(this))
  }

  initialize ({ firesData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)

    this.updateSectionTitle()

    this.chart = new MultiLinesChart(
      super.getContainerSelector(),
      super.getComponentSize()
    )
    this.chart.create(data, getYears(data))
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.fires-firefighters-title')
      .text(`# Fires & Firefighters in ${super.getMunicipality()}`)
  }
}

function getYears (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.year) === -1 ? prev.concat([curr.year]) : prev,
    []
  )
}

export default FiresFirefighters
