import Component from './component.js'
import ClevelandDotPlot from '../idioms/cleveland_dot_plots/index.js'

class Elections extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)
    this.electionTypes = []
    this.parties = ['PS', 'PSD', 'CDS', 'PCP', 'BE', 'Abs.']
    this.charts = []

    dispatch.on('initialize.elections', this.initialize.bind(this))
    dispatch.on('update_municipality.elections', this.update.bind(this))
  }

  initialize ({ electionsData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    this.electionTypes = getElectionTypes(data)

    this.updateSectionTitle()

    const chartWidth =
      Math.floor(super.getComponentSize() / this.electionTypes.length) - 5

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)

      const reducedData = filteredData
        .reduce(
          (prev, curr) =>
            prev.concat(
              this.parties.map(p => ({ key: p, results: [curr[p]] }))
            ),
          []
        )
        .reduce((prev, curr) => {
          const idx = prev.findIndex(el => el.key === curr.key)

          if (idx === -1) {
            prev = prev.concat(curr)
          } else {
            prev[idx].results = prev[idx].results.concat(curr.results)
          }

          return prev
        }, [])

      this.charts.push(
        new ClevelandDotPlot(super.getContainerSelector(), chartWidth)
      )
      this.charts[idx].create(reducedData, getYears(filteredData), electionType)
    })
  }

  update ({ electionsData: newData }, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    this.updateSectionTitle()

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)
        .reduce((prev, curr) => prev.concat(curr.electionResults), [])

      this.charts[idx].update(filteredData, getYears(filteredData))
    })
  }

  updateSectionTitle () {
    d3.select(super.getContainerSelector())
      .select('.elections-title')
      .text(`Elections in ${super.getMunicipality()}`)
  }
}

function getElectionTypes (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.type) === -1 ? prev.concat([curr.type]) : prev,
    []
  )
}

function getYears (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.year) === -1 ? prev.concat([curr.year]) : prev,
    []
  )
}

export default Elections
