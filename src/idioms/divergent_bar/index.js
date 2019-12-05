class DivergentBarChart {
  constructor (parentSelector, chartWidth, withYAxis = false, barHeight = 20) {
    this.parentSelector = parentSelector
    this.barHeight = barHeight
    this.chartWidth = chartWidth
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

  create (data, yAxisDomain = null, chartTitle) {
    this.chart = this.chart
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartWidth)

    this.chart
      .append('g')
      .classed('sub-title', true)
      .attr('transform', (d, i) => `translate(0, ${this.barHeight} )`)
      .append('text')
      .text(chartTitle)
      .classed('is-size-6', true)

    if (yAxisDomain) {
      this.__createYAxis(yAxisDomain)
    }

    this.__setScalerDomainAndRange(data)
    this.__setChartHeight(data.length)

    this.chart
      .append('g')
      .classed('bars-group', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('bars', true)
      .attr('transform', this.__getTranslate.bind(this))
      .call(this.__createRects.bind(this))

    this.__createXAxis(data)
  }

  update (data, yAxisDomain = null) {
    if (yAxisDomain) {
      this.__updateYAxis(yAxisDomain)
    }

    this.__setScalerDomainAndRange(data)
    this.__setChartHeight(data.length)

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
            .call(this.__createRects.bind(this)),
        update =>
          update
            .attr('transform', this.__getTranslate.bind(this))
            .call(this.__updateRects.bind(this)),
        exit => exit.remove()
      )

    this.__updateXAxis(data)
  }

  //
  // Private (auxiliar) functions
  //
  __createYAxis (domain) {
    this.__setYAxisScaler(domain)

    this.chart
      .append('g')
      .classed('y-axis', true)
      .attr(
        'transform',
        `translate(35, ${this.barHeight + this.barHeight / 2})`
      )
      .transition(this.transition)
      .call(this.yAxis)
  }

  __updateYAxis (domain) {
    this.__setYAxisScaler(domain)

    this.chart
      .select('.y-axis')
      .attr(
        'transform',
        `translate(35, ${this.barHeight + this.barHeight / 2})`
      )
      .transition(this.transition)
      .call(this.yAxis)
  }

  __setYAxisScaler (domain) {
    if (this.yAxis === null) {
      this.yAxis = d3.axisLeft()
      this.yScaler = d3.scaleBand()
    }

    this.yScaler.domain(domain).range([20 * domain.length, 0])

    this.yAxis
      .scale(this.yScaler)
      .tickValues(domain)
      .tickFormat(d3.format('d'))
      .tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.
  }

  __createXAxis (data) {
    this.__setXAxisScaler(data)

    this.chart
      .append('g')
      .classed('x-axis', true)
      .attr(
        'transform',
        `translate(${this.yAxisPadding}, ${this.barHeight +
          this.barHeight / 2 +
          this.barHeight * data.length})`
      )
      .transition(this.transition)
      .call(this.xAxis)
  }

  __updateXAxis (data) {
    this.__setXAxisScaler(data)

    this.chart
      .select('.x-axis')
      .attr(
        'transform',
        `translate(${this.yAxisPadding}, ${this.barHeight +
          this.barHeight / 2 +
          this.barHeight * data.length})`
      )
      .transition(this.transition)
      .call(this.xAxis)
  }

  __setXAxisScaler (data) {
    const max = d3.max(data, d => Math.abs(d))
    const scale = d3
      .scaleLinear()
      .domain([-1 * max, max])
      .range([0, this.chartWidth - this.yAxisPadding])

    this.xAxis
      .scale(scale)
      .ticks(3, '~s')
      .tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.
  }

  __setScalerDomainAndRange (newData) {
    this.xScaler
      .domain([0, d3.max(newData, d => Math.abs(d))])
      .range([0, Math.floor((this.chartWidth - this.yAxisPadding) / 2)])
  }

  __setChartHeight (dataLength) {
    this.chart.attr(
      'height',
      this.barHeight * (dataLength + 1) + this.barHeight + this.barHeight / 2
    ) // +1 for the bottom axis
  }

  __createRects (bars) {
    this.__appendOrSelectRectsFrom(bars, 'append')
  }

  __updateRects (bars) {
    this.__appendOrSelectRectsFrom(bars, 'select')
  }

  __appendOrSelectRectsFrom (bars, appendOrSelect) {
    if (['append', 'select'].indexOf(appendOrSelect) === -1) {
      throw Error(
        `"__appendOrSelectRectsFrom" called with wrong argument: ${appendOrSelect}`
      )
    }

    bars[appendOrSelect]('rect')
      .transition(this.transition)
      .attr(
        'x',
        d =>
          Math.floor((this.chartWidth + this.yAxisPadding) / 2) -
          (d < 0 ? this.xScaler(Math.abs(d)) : 0)
      )
      .attr('width', d => this.xScaler(Math.abs(d)))
      .attr('height', this.barHeight - 1)
      .selection()[appendOrSelect]('title')
      .text(d => d)
  }

  __getTranslate (d, i) {
    return `translate(0, ${i * this.barHeight +
      this.barHeight +
      this.barHeight / 2} )`
  }
}

export default DivergentBarChart
