import Legend from '../../../assets/js/d3.legend.js'

class ClevelandDotPlots {
  constructor (parentSelector, chartWidth, chartHeight, dotRadius = 8) {
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
    this.xScalerDomainPadding = 2
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
      .domain([
        -this.xScalerDomainPadding,
        d3.max(data, d => Math.max(...d.results)) + this.xScalerDomainPadding
      ])
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

    svgChart
      .append('g')
      .classed('clevelands', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('circles-and-line', true)
      .call(this.__createLine.bind(this))
      .call(this.__createDots.bind(this))

    this.__createYAxis(svgChart)
    this.__createXAxis(svgChart)
    this.__createLegend(categories)
  }

  update (data, categories) {
    const svgChart = this.sectionElement.select('.svg-chart')

    this.xScaler
      .domain([
        -this.xScalerDomainPadding,
        d3.max(data, d => Math.max(...d.results)) + this.xScalerDomainPadding
      ])
      .range([this.yAxisWidth, this.chartSize.width])

    svgChart
      .select('.clevelands')
      .selectAll('.circles-and-line')
      .data(data)
      .join(
        enter => enter,
        update =>
          update
            .call(this.__updateLine.bind(this))
            .call(this.__updateDots.bind(this))
      )

    this.__updateYAxis(svgChart)
    this.__updateXAxis(svgChart)
    this.__updateLegend(categories)
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
      .select('.x-axis')
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
      .select('.y-axis')
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

  __createLine (lines) {
    lines
      .append('line')
      .transition(this.transition)
      .attr('x1', d => this.xScaler(d3.min(d.results)))
      .attr('x2', d => this.xScaler(d3.max(d.results)))
      .attr('y1', d => this.yScaler(d.key))
      .attr('y2', d => this.yScaler(d.key))
      .attr('stroke', 'grey')
      .attr('stroke-width', 3)
  }

  __updateLine (lines) {
    lines
      .select('line')
      .transition(this.transition)
      .attr('x1', d => this.xScaler(d3.min(d.results)))
      .attr('x2', d => this.xScaler(d3.max(d.results)))
      .attr('y1', d => this.yScaler(d.key))
      .attr('y2', d => this.yScaler(d.key))
      .attr('stroke', 'grey')
      .attr('stroke-width', 3)
  }

  __createDots (lines) {
    lines
      .append('g')
      .classed('circles', true)
      .selectAll('circle')
      .data(d => d.results.map(r => ({ key: d.key, value: r })))
      .enter()
      .append('circle')
      .transition(this.transition)
      .attr('cx', d => this.xScaler(d.value))
      .attr('cy', d => this.yScaler(d.key))
      .attr('r', this.dotRadius)
      .style('fill', (d, i) => this.colors[i])
      .selection()
      .append('title')
      .text(d => d.value)
  }

  __updateDots (lines) {
    lines
      .select('.circles')
      .selectAll('circle')
      .data(d => d.results.map(r => ({ key: d.key, value: r })))
      .join(
        enter => enter,
        update =>
          update
            .transition(this.transition)
            .attr('cx', d => this.xScaler(d.value))
            .attr('cy', d => this.yScaler(d.key))
            .selection()
            .select('title')
            .text(d => d.value)
      )
  }
}

export default ClevelandDotPlots
