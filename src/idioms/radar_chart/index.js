import './index.css'
import * as d3 from 'd3'

class RadarChart {
  constructor (parentSelector, chartWidth, withYAxis = false) {
    this.parentSelector = parentSelector
    this.radius = 5
    this.chartWidth = chartWidth
    this.h = 600
    this.factor = 1
    this.factorLegend = 0.85
    this.levels = 3
    this.maxValue = 0
    this.radians = (2 * Math.PI)
    this.opacityArea = 0.5
    this.ToRight = 5
    this.TranslateX = 80
    this.TranslateY = 30
    this.ExtraWidthX = 100
    this.ExtraWidthY = 100
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
  };

  create (data, yAxisDomain = null) {
    this.chart = this.chart
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartWidth)
      .attr('height', this.dotHeight * data.length)

    this.chart
      .append('g')
      .classed('radar', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('clevelands', true)
  }
}
