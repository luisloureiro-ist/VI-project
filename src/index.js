import './styles.css'
import './components/selections'

import * as d3 from 'd3'
import companiesCSV from './datasets/companies_dataset.csv'
import CompaniesProductivityComponent from './components/companies_productivity'
import ElectionsComponent from './components/elections'
//
//
;(async () => {
  const companiesData = await d3.csv(companiesCSV, parseCompaniesData)

  const defaultMunicipality = 'Continente'
  const containerSelector = '.divergent-charts-section'
  const components = []

  const mainSectionWidth = document.querySelector(containerSelector).offsetWidth
  const dispatch = registerEventListeners(companiesData)

  // Create all the components of the dashboard
  components.push(
    new CompaniesProductivityComponent(
      dispatch,
      containerSelector,
      mainSectionWidth
    )
  )

  components.push(
    new ElectionsComponent(
      dispatch,
      containerSelector,
      mainSectionWidth
    )
  )

  // Initialize dashboard components
  dispatch.call(
    'initialize',
    this,
    companiesData.filter(value => value.location === defaultMunicipality),
    defaultMunicipality
  )
})()

function registerEventListeners (fullDataset) {
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
