import CompaniesProductivityComponent from './components/companies_productivity.js'
import ElectionsComponent from './components/elections.js'
import MapComponent from './components/map.js'
import FiresFirefightersComponent from './components/fires_firefighters.js'
import NumberOfCompaniesComponent from './components/number_of_companies.js'
import YearsRangeSlider from './components/range_slider/index.js'
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
  const defaultYears = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
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

  components.push(new ElectionsComponent(dispatch, '.elections-section'))

  components.push(
    new FiresFirefightersComponent(
      dispatch,
      '.number-of-fires-firefighters-section'
    )
  )
  components.push(new MapComponent(dispatch, '.map-section'))

  components.push(
    new NumberOfCompaniesComponent(dispatch, '.number-of-companies-section')
  )

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
    },
    defaultMunicipality,
    defaultYears
  )
})()

function registerEventListeners ({ companiesData, firesData, electionsData }) {
  const dispatch = d3.dispatch(
    'initialize',
    'region_selected',
    'year_selected',
    'year_deselected',
    'activity_sector_selected',
    'activity_sector_deselected',
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
        electionsData: electionsData
          .filter(filterCallback)
          .filter(d => d.type === 'Local'),
        firesData: firesData
      },
      { name, nuts }
    )
  })

  new YearsRangeSlider('years-range-slider').registerUpdateEventHandler(
    ([min, max]) => {
      const datesRange = []

      for (let i = min; i <= max; i++) {
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
