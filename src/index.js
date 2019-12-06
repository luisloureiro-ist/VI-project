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

  const rightChartsSectionWidth = document.querySelector(
    '.charts-pane .right-charts'
  ).offsetWidth

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
      rightChartsSectionWidth
    )
  )

  components.push(
    new ElectionsComponent(
      dispatch,
      '.cleveland-dot-plot-section'
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
        value =>
          value.location === defaultMunicipality && value.type === 'Local'
      ),
      firesData: firesData
        // Reduce the number of properties to the ones we need
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
    },
    defaultMunicipality
  )
})()

function registerEventListeners ({ companiesData, firesData, electionsData }) {
  const dispatch = d3.dispatch(
    'initialize',
    'region_selected',
    'update_municipality',
    'update_years'
  )

  dispatch.on('region_selected', (nuts, name) => {
    const filterCallback = value =>
      value.nuts === nuts && value.location === name

    dispatch.call(
      'update_municipality',
      this,
      {
        companiesData: companiesData.filter(filterCallback),
        electionsData: firesData.filter(filterCallback),
        firesData: electionsData.filter(filterCallback)
      },
      name
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
