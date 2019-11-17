import './styles.css'
import csv from './finalDataset.csv'
import CompaniesProductivityComponent from './components/companies_productivity'
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
  const dispatch = d3.dispatch('initialize', 'update_municipality')

  d3.selectAll('.municipality').on('click', (d, i, nodesList) => {
    const newMunicipality = nodesList[i].value

    dispatch.call(
      'update_municipality',
      this,
      fullDataset.filter(value => value.location === newMunicipality),
      newMunicipality
    )
  })

  return dispatch
}
