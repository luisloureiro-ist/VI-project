import './index.css'
import * as d3 from 'd3'

class DivergentBarChart {
  constructor (parentSelector, chartWidth, barHeight = 20) {
    this.parentSelector = parentSelector
    this.barHeight = barHeight
    this.chartWidth = chartWidth
    this.chart = d3.select(this.parentSelector)
    this.scaler = d3.scaleLinear()
  }

  create (data) {
    this.chart = this.chart
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartWidth)

    this.__setScalerDomainAndRange(data).__setChartHeight(data.length)

    const bar = this.chart
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', this.__getTranslate.bind(this))

    this.__createRect(bar)
  }

  update (data) {
    this.__setScalerDomainAndRange(data).__setChartHeight(data.length)

    this.chart
      .selectAll('g')
      .data(data)
      .join(
        enter =>
          enter
            .append('g')
            .attr('transform', this.__getTranslate.bind(this))
            .call(this.__createRect.bind(this)),
        update =>
          update
            .attr('transform', this.__getTranslate.bind(this))
            .call(this.__updateRect.bind(this)),
        exit => exit.remove()
      )
  }

  //
  // Private (auxiliar) functions
  //
  __setScalerDomainAndRange (newData) {
    this.scaler
      .domain([0, d3.max(newData, d => Math.abs(d))])
      .range([0, this.chartWidth / 2])

    return this
  }

  __setChartHeight (dataLength) {
    this.chart.attr('height', this.barHeight * dataLength)

    return this
  }

  __createRect (bar) {
    return bar
      .append('rect')
      .attr(
        'x',
        d => this.chartWidth / 2 - (d < 0 ? this.scaler(Math.abs(d)) : 0)
      )
      .attr('width', d => this.scaler(Math.abs(d)))
      .attr('height', this.barHeight - 1)
      .append('title')
      .text(d => d)
  }

  __updateRect (bar) {
    return bar
      .select('rect')
      .attr(
        'x',
        d => this.chartWidth / 2 - (d < 0 ? this.scaler(Math.abs(d)) : 0)
      )
      .attr('width', d => this.scaler(Math.abs(d)))
      .attr('height', this.barHeight - 1)
      .select('title')
      .text(d => d)
  }

  __getTranslate (d, i) {
    return `translate(0, ${i * this.barHeight} )`
  }
}

export default DivergentBarChart
