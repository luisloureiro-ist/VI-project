import Legend from '../../../assets/js/d3.legend.js'

class ClevelandDotPlots {
  constructor (parentSelector, chartWidth, chartHeight, dotRadius = 15) {
    this.parentSelector = parentSelector
    this.legendHeight = 50
    this.chartSize = {
      width: chartWidth,
      height: chartHeight - this.legendHeight
    }
    this.dotRadius = dotRadius
    this.sectionElement = d3.select(this.parentSelector)
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
    this.colors = d3.schemeDark2
  }

  create (data, categories, chartTitle) {
    const svgChart = this.sectionElement
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

    svgChart
      .append('g')
      .classed('sub-title', true)
      .attr('transform', () => `translate(0, ${this.subTitleHeight} )`)
      .append('text')
      .text(chartTitle)
      .classed('is-size-6', true)

    const lineAndCirclesGroup = svgChart
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

    this.__createYAxis(svgChart)
    this.__createXAxis(svgChart)
    this.__createLegend(categories)
  }

  update (data, categories) {
    const svgChart = this.sectionElement.select('svg-chart')

    this.__updateYAxis(svgChart)
    this.__updateXAxis(svgChart)
    this.__updateLegend(categories)

    this.xScaler
      .domain([0, d3.max(data, d => Math.max(...d.results)) + 2])
      .range([0, this.chartSize.width - this.yAxisWidth])

    svgChart.attr('height', this.chartSize.height)

    svgChart
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

  __createXAxis (svgChart) {
    this.xAxis.scale(this.xScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    svgChart
      .append('g')
      .classed('x-axis', true)
      .attr(
        'transform',
        `translate(0, ${this.chartSize.height - this.xAxisHeight})`
      )
      .transition(this.transition)
      .call(this.xAxis)
  }

  __updateXAxis (svgChart) {
    this.xAxis.scale(this.xScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    svgChart
      .select('x-axis', true)
      .transition(this.transition)
      .call(this.xAxis)
  }

  __createYAxis (svgChart) {
    this.yAxis.scale(this.yScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    svgChart
      .append('g')
      .classed('y-axis', true)
      .attr('transform', `translate(${this.yAxisWidth}, 0)`)
      .transition(this.transition)
      .call(this.yAxis)
  }

  __updateYAxis (svgChart) {
    this.yAxis.scale(this.yScaler).tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.

    svgChart
      .select('y-axis', true)
      .transition(this.transition)
      .call(this.yAxis)
  }

  __createLegend (categories) {
    this.sectionElement
      .append(
        () =>
          new Legend({
            color: d3.scaleThreshold(
              categories,
              this.colors.slice(0, categories.length)
            ),
            title: 'Years with elections',
            tickFormat: 'd',
            width: 108
          })
      )
      .classed('svg-legend', true)
      .selectAll('.tick text')
      .attr('x', -18)
  }

  __updateLegend (categories) {
    this.sectionElement.select('.svg-legend').remove()

    this.__createLegend(categories)
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
