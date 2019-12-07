import Component from './component.js'
import MultiLinesChart from '../idioms/multi_lines_chart/index.js'

class FiresFirefighters extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, { width: document.querySelector(parentSelector).offsetWidth, height: document.querySelector(parentSelector).offsetHeight - 36 })

    dispatch.on('initialize.fires_firefighters', this.initialize.bind(this))
  }

  initialize ({ firesData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)

    this.updateSectionTitle()

    this.chart = new MultiLinesChart(
      super.getContainerSelector(),
      super.getComponentSize().width,
      super.getComponentSize().height
    )

    this.chart.create(getValues(data), getYears(data))
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
