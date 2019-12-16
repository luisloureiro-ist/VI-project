import Component from './component.js'
import ClevelandDotPlot from '../idioms/cleveland_dot_plots/index.js'

class Elections extends Component {
  constructor (dispatch, parentSelector) {
    super(dispatch, parentSelector, {
      width: document.querySelector(parentSelector).offsetWidth,
      height: document.querySelector(parentSelector).offsetHeight - 51 // The height+margin of the title
    })
    this.electionTypes = []
    this.parties = [
      { acronym: 'PS', text: 'PS' },
      { acronym: 'PSD', text: 'PSD' },
      { acronym: 'CDS', text: 'CDS' },
      { acronym: 'PCP', text: 'PCP' },
      { acronym: 'BE', text: 'BE' },
      { acronym: 'Abs.', text: 'Abstention' }
    ]
    this.charts = []

    dispatch.on('initialize.elections', this.initialize.bind(this))
    dispatch.on('update_municipality.elections', this.update.bind(this))
  }

  initialize ({ electionsData: data }, municipality) {
    super.setMunicipality(municipality)
    super.setDataset(data)
    this.electionTypes = getElectionTypes(data)

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)

      const reducedData = transformData.call(this, filteredData)

      this.charts.push(
        new ClevelandDotPlot(
          super.getContainerSelector(),
          super.getComponentSize().width,
          super.getComponentSize().height,
          year => super.getDispatch().call('year_selected', this, year),
          () => super.getDispatch().call('year_deselected')
        )
      )
      this.charts[idx].create(
        reducedData,
        getYears(filteredData),
        (party, year, result) =>
          `"${
            this.parties.find(p => p.acronym === party).text
          }" result in ${year}:\n${result * 100}%`
      )
    })
  }

  update ({ electionsData: newData }, newMunicipality) {
    super.setDataset(newData)
    super.setMunicipality(newMunicipality)

    this.electionTypes.forEach((electionType, idx) => {
      const filteredData = super
        .getDataset()
        .filter(d => d.type === electionType)

      const reducedData = transformData.call(this, filteredData)

      this.charts[idx].update(
        reducedData,
        getYears(filteredData),
        (party, year, result) => `${party} result in ${year}:\n${result * 100}%`
      )
    })
  }
}

function transformData (data) {
  return data
    .reduce(
      (prev, curr) =>
        prev.concat(
          this.parties.map(p => ({
            key: p.acronym,
            results: [curr[p.acronym]]
          }))
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
