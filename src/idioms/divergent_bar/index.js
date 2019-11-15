import './index.css'
import * as d3 from 'd3'

class DivergentBarChart {
  constructor (parentSelector, chartWidth, barHeight = 20) {
    this.parentSelector = parentSelector
    this.barHeight = barHeight
    this.chartWidth = chartWidth
    this.chart = d3.select(this.parentSelector)
    this.scaler = d3.scaleLinear()
    this.xAxis = d3.axisBottom()
    this.yAxis = null
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

    if (yAxisDomain) {
      this.__setYAxisScaler(yAxisDomain)
      this.__createYAxis()
    }

    this.__setScalerDomainAndRange(data).__setChartHeight(data.length)

    const bar = this.chart
      .append('g')
      .classed('bars-group', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('bars', true)
      .attr('transform', this.__getTranslate.bind(this))

    this.__createRect(bar)

    this.__setXAxisScaler(data)
    this.__createXAxis(data.length)
  }

  update (data, yAxisDomain = null) {
    if (yAxisDomain) {
      this.__setYAxisScaler(yAxisDomain)
      this.__updateYAxis()
    }

    this.__setScalerDomainAndRange(data).__setChartHeight(data.length)

    this.chart
      .select('.bars-group')
      .selectAll('.bars')
      .data(data)
      .join(
        enter =>
          enter
            .append('g')
            .attr('transform', this.__getTranslate.bind(this))
            .classed('bars', true)
            .call(this.__createRect.bind(this)),
        update =>
          update
            .attr('transform', this.__getTranslate.bind(this))
            .call(this.__updateRect.bind(this)),
        exit => exit.remove()
      )

    this.__setXAxisScaler(data)
    this.__updateXAxis(data.length)
  }

  //
  // Private (auxiliar) functions
  //
  __createYAxis () {
    this.chart
      .append('g')
      .classed('y-axis', true)
      .attr('transform', 'translate(35, 0)')
      .transition(this.transition)
      .call(this.yAxis)
  }

  __updateYAxis () {
    this.chart
      .select('.y-axis')
      .attr('transform', 'translate(35, 0)')
      .transition(this.transition)
      .call(this.yAxis)
  }

  __setYAxisScaler (domain) {
    if (this.yAxis === null) {
      this.yAxis = d3.axisLeft()
    }
    const scale = d3
      .scaleLinear()
      .domain([domain[0], domain[domain.length - 1]])
      .range([20 * domain.length, 0])

    this.yAxis
      .scale(scale)
      .tickValues(domain)
      .tickFormat(d3.format('d'))
  }

  __createXAxis (dataLength) {
    const rangeStart = this.yAxis !== null ? 35 : 0

    this.chart
      .append('g')
      .classed('x-axis', true)
      .attr(
        'transform',
        `translate(${rangeStart}, ${this.barHeight * dataLength})`
      )
      .transition(this.transition)
      .call(this.xAxis)
  }

  __updateXAxis (dataLength) {
    const rangeStart = this.yAxis !== null ? 35 : 0

    this.chart
      .select('.x-axis')
      .attr(
        'transform',
        `translate(${rangeStart}, ${this.barHeight * dataLength})`
      )
      .transition(this.transition)
      .call(this.xAxis)
  }

  __setXAxisScaler (data) {
    const rangeStart = this.yAxis !== null ? 35 : 0
    const max = d3.max(data, d => Math.abs(d))
    const scale = d3
      .scaleLinear()
      .domain([-1 * max, max])
      .range([0, this.chartWidth - rangeStart])

    this.xAxis
      .scale(scale)
      .ticks(3, '~s')
      .tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    return this.xAxis
  }

  __setScalerDomainAndRange (newData) {
    const rangeStart = this.yAxis !== null ? 35 : 0

    this.scaler
      .domain([0, d3.max(newData, d => Math.abs(d))])
      .range([0, Math.floor((this.chartWidth - rangeStart) / 2)])

    return this
  }

  __setChartHeight (dataLength) {
    this.chart.attr('height', this.barHeight * (dataLength + 1)) // +1 for the bottom axis

    return this
  }

  __createRect (bar) {
    const rangeStart = this.yAxis !== null ? 35 : 0
    const rect = bar.append('rect')

    rect
      .transition(this.transition)
      .attr(
        'x',
        d =>
          Math.floor((this.chartWidth + rangeStart) / 2) -
          (d < 0 ? this.scaler(Math.abs(d)) : 0)
      )
      .attr('width', d => this.scaler(Math.abs(d)))
      .attr('height', this.barHeight - 1)

    rect.append('title').text(d => d)

    return bar
  }

  __updateRect (bar) {
    const rangeStart = this.yAxis !== null ? 35 : 0
    const rect = bar.select('rect')

    rect
      .transition(this.transition)
      .attr(
        'x',
        d =>
          Math.floor((this.chartWidth + rangeStart) / 2) -
          (d < 0 ? this.scaler(Math.abs(d)) : 0)
      )
      .attr('width', d => this.scaler(Math.abs(d)))
      .attr('height', this.barHeight - 1)

    rect.select('title').text(d => d)

    return bar
  }

  __getTranslate (d, i) {
    return `translate(0, ${i * this.barHeight} )`
  }
}

export default DivergentBarChart
