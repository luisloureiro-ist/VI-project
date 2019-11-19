import './index.css'
import * as d3 from 'd3'

class ClevelandDotPlots {
  constructor (parentSelector, chartWidth, withYAxis = false, dotHeight = 20) {
    this.parentSelector = parentSelector
    this.chartWidth = chartWidth
    this.dotHeight = dotHeight
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
  }

  create (data, yAxisDomain = null) {
    this.chart = this.chart
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartWidth)
      .attr('height', this.dotHeight * data.length)

    this.chart
      .append('g')
      .classed('cleveland', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('clevelands', true)
      .call(this.__createCircle)
  }

  __createCircle (lines) {
    lines
      .append('circle')
      .attr('cx', function (d) { return this.xAxis(d.value) })
      .attr('cy', function (d) { return this.yAxis(d.party) })
      .attr('r', '6')
      .style('fill', '#4C4082')
  }
}

export default ClevelandDotPlots
