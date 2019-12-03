import CompaniesProductivityComponent from './components/companies_productivity.js'
import ElectionsComponent from './components/elections.js'
import MapComponent from './components/map.js'
//
//
;(async () => {
  const companiesCSV = '/assets/datasets/companies_dataset.csv'
  const electionsCSV = '/assets/datasets/elections_dataset.csv'
  const firesCSV = '/assets/datasets/fires_dataset.csv'

  const [companiesData, electionsData, firesData] = await Promise.all([
    d3.csv(companiesCSV, parseCompaniesData),
    d3.csv(electionsCSV, parseElectionsData),
    d3.csv(firesCSV, parseFiresData)
  ])

  const defaultMunicipality = 'Continente'
  const components = []

  const mainSectionWidth = document.querySelector('.charts-pane').offsetWidth
  const dispatch = registerEventListeners({
    companiesData,
    electionsData,
    firesData
  })

  // Create all the components of the dashboard
  components.push(
    new CompaniesProductivityComponent(
      dispatch,
      '.divergent-charts-section',
      mainSectionWidth
    )
  )

  components.push(
    new ElectionsComponent(
      dispatch,
      '.cleveland-dot-plot-section',
      mainSectionWidth
    )
  )

  components.push(new MapComponent(dispatch, '.map-pane', 0))

  // Initialize dashboard components
  dispatch.call(
    'initialize',
    this,
    {
      companiesData: companiesData.filter(
        value => value.location === defaultMunicipality
      ),
      electionsData: electionsData.filter(
        value => value.location === defaultMunicipality
      ),
      firesData: firesData.filter(
        value => value.location === defaultMunicipality
      )
    },
    defaultMunicipality
  )
})()

function registerEventListeners ({ companiesData: fullDataset }) {
  const dispatch = d3.dispatch(
    'initialize',
    'update_municipality',
    'update_years'
  )

  d3.selectAll('.municipality').on('click', (d, i, nodesList) => {
    const newMunicipality = nodesList[i].value

    dispatch.call(
      'update_municipality',
      this,
      fullDataset.filter(value => value.location === newMunicipality),
      newMunicipality
    )
  })

  d3.selectAll('.years-range > input[type=range').on(
    'input mousedown',
    (d, i, nodesList) => {
      const datesRange = []

      for (let i = +nodesList[0].value; i <= +nodesList[1].value; i++) {
        datesRange.push(i)
      }

      dispatch.call('update_years', this, datesRange)
    }
  )

  return dispatch
}

function parseCompaniesData (datum) {
  return {
    nuts: datum.NUTS,
    location: datum.Location,
    year: +datum.Year,
    type: datum['Company Type'],
    number: +datum['Number of Companies'],
    productivity: +datum.Productivity
  }
}

function parseElectionsData (datum) {
  return {
    nuts: datum.NUTS,
    location: datum.Location,
    year: +datum.Year,
    type: datum['Election Type'],
    PS: +datum.PS,
    PSD: +datum.PSD,
    CDS: +datum.CDS,
    PCP: +datum.PCP,
    BE: +datum.BE,
    'Abs.': +datum.Abstention
  }
}

function parseFiresData (datum) {
  return {
    nuts: datum.NUTS,
    location: datum.Location,
    year: +datum.Year,
    fires: +datum.Fires,
    firefighters: +datum.Firefighters,
    tourism: +datum.Tourism
  }
}
