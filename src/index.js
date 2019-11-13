import './styles.css'
import csv from './finalDataset.csv'
import DivergentBarChart from './idioms/divergent_bar'
import * as d3 from 'd3'
//
//
;(async () => {
  const data = await load(csv)

  const dispatch = registerEventListeners()
  dispatch.call('load', this, data, 'Continente')
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

function registerEventListeners () {
  let dataset = []
  const barCharts = []
  const dispatch = d3.dispatch('load', 'update')

  dispatch.on('load', (data, municipality) => {
    dataset = data

    dispatch.call('update', this, municipality)
  })

  dispatch.on('update.dashboard', municipalityName => {
    const containerSelector = '.divergent-charts-section'
    const data = dataset.filter(d => {
      return d.location === municipalityName
    })

    const mainSectionWidth = document.querySelector(containerSelector)
      .offsetWidth
    const activitySectors = getActivitySectors(data)
    const numberOfActivitySectors = activitySectors.length
    const chartWidth =
      Math.floor(mainSectionWidth / numberOfActivitySectors) - 5

    // column with the years
    for (let index = 0; index < numberOfActivitySectors; index++) {
      const filteredData = data
        .filter(d => d.type === activitySectors[index])
        .reduce((prev, curr) => prev.concat(curr.productivity), [])

      if (barCharts[index]) {
        barCharts[index].update(filteredData)
      } else {
        const newLength = barCharts.push(
          new DivergentBarChart(containerSelector, chartWidth)
        )
        barCharts[newLength - 1].create(filteredData)
      }
    }
  })

  d3.selectAll('.municipality').on('click', (d, i, nodesList) => {
    dispatch.call('update', this, nodesList[i].value)
  })

  return dispatch
}

function getActivitySectors (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.type) === -1 ? prev.concat([curr.type]) : prev,
    []
  )
}
