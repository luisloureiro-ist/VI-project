import './styles.css'
import csv from './finalDataset.csv'
import DivergentBarChart from './idioms/divergent_bar'
import * as d3 from 'd3'
//
//
;(async () => {
  const containerSelector = '.divergent-charts-section'
  let data = await load(csv)

  data = data.filter(d => {
    return d.location === 'Continente'
  })

  const mainSectionWidth = document.querySelector(containerSelector).offsetWidth
  const activitySectors = getActivitySectors(data)
  const numberOfActivitySectors = activitySectors.length
  const chartWidth = Math.floor(mainSectionWidth / numberOfActivitySectors) - 5

  // column with the years
  for (let index = 0; index < activitySectors.length; index++) {
    const filteredData = data
      .filter(d => d.type === activitySectors[index])
      .reduce((prev, curr) => prev.concat(curr.productivity), [])

    new DivergentBarChart(containerSelector, chartWidth).create(filteredData)
  }
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

function getActivitySectors (data) {
  return data.reduce(
    (prev, curr) =>
      prev.indexOf(curr.type) === -1 ? prev.concat([curr.type]) : prev,
    []
  )
}
