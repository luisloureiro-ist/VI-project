import './index.css'
import * as d3 from 'd3'

class ClevelandDotPlots {
  constructor (parentSelector, chartWidth, withYAxis = false, dotRadius = 7) {
    this.parentSelector = parentSelector
    this.chartWidth = chartWidth
    this.dotRadius = dotRadius
    this.chart = d3.select(this.parentSelector)
    this.xScaler = d3.scaleLinear()
    this.xAxis = d3.axisBottom()
    this.yScaler = null
    this.yAxis = null
    this.yAxisPadding = +(withYAxis && 35) // if false then equals 0
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
    this.colors = ['#1b9e77', '#d95f02', '#7570b3']
  }

  create (data) {
    this.chart = this.chart
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartWidth)
      .attr('height', 3 * this.dotRadius * (data.length + 1)) // +1 for the bottom axis

    this.xScaler
      .domain([0, d3.max(data, d => Math.max(...d.results))])
      .range([0, this.chartWidth - this.yAxisPadding])
    this.yScaler = d3
      .scaleBand()
      .range([0, 3 * this.dotRadius * data.length])
      .domain(data.map(d => d.key))

    const lineAndCirclesGroup = this.chart
      .append('g')
      .classed('clevelands', true)
      .attr('transform', (d, i) => `translate(0, ${this.dotRadius} )`)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('cleveland', true)

    data[0].results.forEach((result, idx) => {
      lineAndCirclesGroup.call(this.__createDot.bind(this, idx))
    })

    this.__createXAxis(data)
    this.__createYAxis(data)
  }

  __createXAxis (data) {
    this.xAxis.scale(this.xScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    this.chart
      .append('g')
      .classed('x-axis', true)
      .attr(
        'transform',
        `translate(${this.yAxisPadding}, ${3 * this.dotRadius * data.length})`
      )
      .transition(this.transition)
      .call(this.xAxis)
  }

  __createYAxis (domain) {
    if (this.yAxis === null) {
      this.yAxis = d3.axisLeft()
    }

    this.yAxis.scale(this.yScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    this.chart
      .append('g')
      .classed('y-axis', true)
      .attr('transform', `translate(${this.yAxisPadding}, 0)`)
      .transition(this.transition)
      .call(this.yAxis)
  }

  __createDot (resultsIdx, lines) {
    lines
      .append('circle')
      .transition(this.transition)
      .attr('cx', d => this.xScaler(d.results[resultsIdx]) + this.yAxisPadding)
      .attr('cy', d => this.yScaler(d.key) + this.dotRadius / 2)
      .attr('r', this.dotRadius)
      .style('fill', () => this.colors[resultsIdx])
      .selection()
      .append('title')
      .text(d => d.results[resultsIdx])
  }
}

export default ClevelandDotPlots
