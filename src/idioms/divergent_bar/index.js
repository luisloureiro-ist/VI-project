import * as d3 from 'd3'

class DivergentBarChart {
  constructor (parentSelector, chartWidth, barHeight = 20) {
    this.parentSelector = parentSelector
    this.barHeight = barHeight
    this.chartWidth = chartWidth
  }

  create (data) {
    const scaler = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => Math.abs(d))])
      .range([0, this.chartWidth / 2])

    const chart = d3
      .select(this.parentSelector)
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartWidth)
      .attr('height', this.barHeight * data.length)

    const bar = chart
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0, ${i * this.barHeight} )`)

    bar
      .append('rect')
      .attr('x', d => this.chartWidth / 2 - (d < 0 ? scaler(Math.abs(d)) : 0))
      .attr('width', d => scaler(Math.abs(d)))
      .attr('height', this.barHeight - 1)
      .append('title')
      .text(d => d)
  }
}

export default DivergentBarChart
