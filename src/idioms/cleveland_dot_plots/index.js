class ClevelandDotPlots {
  constructor (parentSelector, chartWidth, chartHeight, dotRadius = 15) {
    this.parentSelector = parentSelector
    this.chartSize = {
      width: chartWidth,
      height: chartHeight
    }
    this.dotRadius = dotRadius
    this.chart = d3.select(this.parentSelector)
    this.xScaler = d3.scaleLinear()
    this.xAxis = d3.axisBottom()
    this.yScaler = d3.scalePoint()
    this.yAxis = d3.axisLeft()
    this.subTitleHeight = 21 + 20
    this.xAxisHeight = 35
    this.yAxisWidth = 35
    this.yAxisHeight =
      this.chartSize.height - this.xAxisHeight - this.subTitleHeight
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
    this.colors = ['#1b9e77', '#d95f02', '#7570b3']
  }

  create (data, categories, chartTitle) {
    this.chart = this.chart
      .append('svg')
      .classed('svg-chart', true)
      .attr('width', this.chartSize.width)
      .attr('height', this.chartSize.height)

    this.xScaler
      .domain([0, d3.max(data, d => Math.max(...d.results)) + 2])
      .range([this.yAxisWidth, this.chartSize.width])
    this.yScaler
      .domain(data.map(d => d.key))
      .rangeRound([this.subTitleHeight, this.yAxisHeight + this.subTitleHeight])
      .padding(0.5)

    this.chart
      .append('g')
      .classed('sub-title', true)
      .attr('transform', () => `translate(0, ${this.subTitleHeight} )`)
      .append('text')
      .text(chartTitle)
      .classed('is-size-6', true)

    const lineAndCirclesGroup = this.chart
      .append('g')
      .classed('clevelands', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('cleveland', true)

    data[0].results.forEach((result, idx) => {
      lineAndCirclesGroup.call(this.__createDot.bind(this, idx))
    })

    this.__createYAxis(data)
    this.__createXAxis(data)
    this.__createLegend(categories)
  }

  update (data, categories) {
    this.__updateYAxis(data)
    this.__updateXAxis(data)
    this.__updateLegend(categories)

    this.xScaler
      .domain([0, d3.max(data, d => Math.max(...d.results)) + 2])
      .range([0, this.chartSize.width - this.yAxisWidth])

    this.chart.attr('height', this.chartSize.height)

    this.chart
      .select('.clevelands')
      .selectAll('.cleveland')
      .data(data)
      .join(
        enter => {
          const lineAndCirclesGroup = enter
            .append('g')
            .classed('cleveland', true)

          data[0].results.forEach((result, idx) => {
            lineAndCirclesGroup.call(this.__createDot.bind(this, idx))
          })
        },
        update => update.call(this.__updateDot.bind(this)),
        exit => exit.remove()
      )

    this.__updateXAxis(data)
  }

  __createXAxis () {
    this.xAxis.scale(this.xScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    this.chart
      .append('g')
      .classed('x-axis', true)
      .attr(
        'transform',
        `translate(0, ${this.chartSize.height - this.xAxisHeight})`
      )
      .transition(this.transition)
      .call(this.xAxis)
  }

  __updateXAxis () {
    this.xAxis.scale(this.xScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    this.chart
      .select('x-axis', true)
      .transition(this.transition)
      .call(this.xAxis)
  }

  __createYAxis () {
    this.yAxis.scale(this.yScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    this.chart
      .append('g')
      .classed('y-axis', true)
      .attr('transform', `translate(${this.yAxisWidth}, 0)`)
      .transition(this.transition)
      .call(this.yAxis)
  }

  __updateYAxis () {
    this.yAxis.scale(this.yScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    this.chart
      .select('y-axis', true)
      .transition(this.transition)
      .call(this.yAxis)
  }

  __createLegend (categories) {
    const legend = this.chart
      .append('g')
      .classed('legend', true)
      .attr('height', 30)
      .attr('transform', `translate(${this.yAxisWidth},30)`)
    categories.forEach((category, idx) => {
      legend
        .append('circle')
        .attr('cx', 50 + idx * 50)
        .attr('cy', 130)
        .attr('r', 6)
        .style('fill', this.colors[idx])
      legend
        .append('text')
        .attr('x', 50 + idx * 50 + 12)
        .attr('y', 131)
        .text(category)
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle')
    })
  }

  __updateLegend (categories) {
    const legend = this.chart.append('g').classed('legend', true)
    categories.forEach((category, idx) => {
      legend
        .select('circle')
        .attr('cx', 50 + idx * 50)
        .attr('cy', 130)
        .attr('r', 6)
        .style('fill', this.colors[idx])
      legend
        .select('text')
        .attr('x', 50 + idx * 50 + 12)
        .attr('y', 131)
        .text(category)
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle')
    })
  }

  __createDot (resultsIdx, lines) {
    lines
      .append('circle')
      .transition(this.transition)
      .attr('cx', d => this.xScaler(d.results[resultsIdx]))
      .attr('cy', d => this.yScaler(d.key))
      .attr('r', this.dotRadius)
      .style('fill', () => this.colors[resultsIdx])
      .selection()
      .append('title')
      .text(d => d.results[resultsIdx])
  }

  __updateDot (resultsIdx, lines) {
    lines
      .select('circle')
      .transition(this.transition)
      .attr('cx', d => this.xScaler(d.results[resultsIdx]) + this.yAxisWidth)
      .attr('cy', d => this.yScaler(d.key) + this.dotRadius / 2)
      .attr('r', this.dotRadius)
      .style('fill', () => this.colors[resultsIdx])
      .selection()
      .select('title')
      .text(d => d.results[resultsIdx])
  }
}

export default ClevelandDotPlots
