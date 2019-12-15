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
      this.update.bind(this)
    )
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

    const filteredData = data.filter(d => d.location === municipality)
    this.chart.create(getValues(filteredData), getYears(filteredData))
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.title')
      .text(`Fires & Firefighters in ${super.getMunicipality()}`)
  }

  update ({ firesData: newData }, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    this.updateSectionTitle()

    const filteredData = newData.filter(d => d.location === newMunicipality)

    this.chart.update(getValues(filteredData), getYears(filteredData)
    )
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
