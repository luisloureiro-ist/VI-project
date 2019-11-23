import './styles.css'
import csv from './finalDataset.csv'
import './components/selections'
import CompaniesProductivityComponent from './components/companies_productivity'
import ElectionsComponent from './components/elections'
import * as d3 from 'd3'
//
//
;(async () => {
  const data = await load(csv)
  const defaultMunicipality = 'Continente'
  const containerSelector = '.divergent-charts-section'
  const components = []

  const mainSectionWidth = document.querySelector(containerSelector).offsetWidth
  const dispatch = registerEventListeners(data)

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
    data.filter(value => value.location === defaultMunicipality),
    defaultMunicipality
  )
})()

async function load (filename) {
  return d3.csv(filename, d => {
    return {
      location: d.Location,
      year: +d.Year,
      type: d['Company Type'],
      // number: +d['Number of Companies'],
      productivity: +d.Productivity
    }
  })
}

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
