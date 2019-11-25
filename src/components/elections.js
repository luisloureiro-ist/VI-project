import Component from './component'
import ClevelandDotPlot from '../idioms/cleveland_dot_plots'

class Elections extends Component {
  constructor (dispatch, parentSelector, componentSize) {
    super(dispatch, parentSelector, componentSize)
    this.electionTypes = []
    this.parties = ['PS', 'PSD', 'CDS', 'PCP', 'BE', 'abstention']
    this.charts = []

    dispatch.on('initialize', this.initialize.bind(this))
    dispatch.on('update_municipality', this.update.bind(this))
  }

  initialize ({ electionsData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    this.electionTypes = getElectionTypes(data)

    const chartWidth =
      Math.floor(super.getComponentSize() / this.electionTypes.length) - 5

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)
        .map(d => this.parties.map(p => ({ key: p, value: d[p] })))
        .slice(1)
        .reduce((prev, curr) => curr, [])
      // .sort((first, second) => second.year - first.year)

      this.charts.push(
        new ClevelandDotPlot(
          super.getContainerSelector(),
          chartWidth,
          idx === 0
        )
      )
      this.charts[idx].create(filteredData)
    })
  }

  update (newData, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)
        .reduce((prev, curr) => prev.concat(curr.electionResults), [])

      this.charts[idx].update(filteredData)
    })
  }
}

function getElectionTypes (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.type) === -1 ? prev.concat([curr.type]) : prev,
    []
  )
}

export default Elections
