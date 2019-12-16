import Legend from '../../../assets/js/d3.legend.js'

class ClevelandDotPlots {
  constructor (
    parentSelector,
    chartWidth,
    chartHeight,
    onMouseOverDotCallback,
    onMouseLeaveDotCallback,
    dotRadius = 6
  ) {
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
    this.xScalerDomainPadding = 0.02
    this.xAxisHeight = 35
    this.yAxisWidth = 35
    this.yAxisHeight = this.chartSize.height - this.xAxisHeight
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
    this.colors = d3.schemeDark2
    this.onOverCallback = onMouseOverDotCallback
    this.onLeaveCallback = onMouseLeaveDotCallback
  }

  create (data, categories, dotsTitleFn) {
    const svgChart = this.sectionElement
      .append('svg')
      .classed('svg-chart cleveland-dot-plot', true)
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
      .rangeRound([0, this.yAxisHeight])
      .padding(0.5)

    svgChart
      .append('g')
      .classed('clevelands', true)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .classed('circles-and-line', true)
      .call(this.__createLine.bind(this))
      .call(this.__createDots.bind(this, dotsTitleFn, categories))
      .call(this.__createRects.bind(this))
      .call(this.__attachEventsToCircles.bind(this, categories))
      .call(this.__attachEventsToCirclesAndLinesGroup.bind(this))

    this.__createYAxis(svgChart)
    this.__createXAxis(svgChart)
    this.__createLegend(categories)
  }

  update (data, categories, dotsTitleFn) {
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
            .call(this.__updateDots.bind(this, dotsTitleFn, categories))
            .call(this.__updateRects.bind(this))
      )

    this.__updateYAxis(svgChart)
    this.__updateXAxis(svgChart)
    this.__updateLegend(categories)
  }

  __createXAxis (svgChart) {
    var formatPercent = d3.format('.0%')
    this.xAxis
      .scale(this.xScaler)
      .tickSizeOuter(0) // suppresses the square ends of the domain path, instead producing a straight line.
      .tickFormat(formatPercent)

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
      .interrupt() // Avoids "too late; already running" error
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
      .interrupt() // Avoids "too late; already running" error
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
            title: 'Years with elections:',
            tickFormat: 'd',
            width: 108
          })
      )
      .classed('svg-legend cleveland-dot-plot', true)
      .selectAll('.tick text')
      .attr('x', -18)
  }

  __updateLegend (categories) {
    this.sectionElement.select('.svg-legend').remove()

    this.__createLegend(categories)
  }

  __createLine (group) {
    const lineGenerator = d3
      .line()
      .x((d, i) => this.xScaler(d.value))
      .y(d => this.yScaler(d.key))

    group
      .append('path')
      .transition(this.transition)
      .call(path =>
        path
          .attr('d', d =>
            lineGenerator(d.results.map(r => ({ key: d.key, value: r })))
          )
          .attr('stroke-opacity', 1)
      )
  }

  __updateLine (lines) {
    const lineGenerator = d3
      .line()
      .x((d, i) => this.xScaler(d.value))
      .y(d => this.yScaler(d.key))

    lines
      .select('path')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .call(path =>
        path.attr('d', d =>
          lineGenerator(d.results.map(r => ({ key: d.key, value: r })))
        )
      )
  }

  __createDots (titleFn, categories, lines) {
    lines
      .append('g')
      .classed('circles', true)
      .selectAll('circle')
      .data(d => d.results.map(r => ({ key: d.key, value: r })))
      .enter()
      .append('circle')
      .attr('cx', d => this.xScaler(d.value))
      .attr('cy', d => this.yScaler(d.key))
      .attr('r', this.dotRadius)
      .transition(this.transition)
      .attr('fill-opacity', 1)
      .attr('fill', (d, i) => this.colors[i])
      .selection()
      .append('title')
      .text((d, i) => titleFn(d.key, categories[i], d3.format('.2%')(d.value)))
  }

  __updateDots (titleFn, categories, lines) {
    lines
      .select('.circles')
      .selectAll('circle')
      .data(d => d.results.map(r => ({ key: d.key, value: r })))
      .join(
        enter => enter,
        update =>
          update
            .interrupt() // Avoids "too late; already running" error
            .transition(this.transition)
            .attr('cx', d => this.xScaler(d.value))
            .attr('cy', d => this.yScaler(d.key))
            .selection()
            .select('title')
            .text((d, i) =>
              titleFn(d.key, categories[i], d3.format('.2%')(d.value))
            )
      )
  }

  __createRects (group) {
    // For the mouse events to work correctly, we need to insert a rect
    // Without this rect, these events wouldn't work when mouse is on an
    // "empty" space,
    // e.g., the space between the upper and lower borders of the 'g' element and 'path' inside this 'g'
    group
      .insert('rect', ':first-child')
      .attr('height', this.dotRadius * 2)
      .attr(
        'width',
        d =>
          Math.abs(
            this.xScaler(d3.min(d.results)) - this.xScaler(d3.max(d.results))
          ) +
          this.dotRadius * 2
      )
      .attr('x', d => this.xScaler(d3.min(d.results)) - this.dotRadius)
      .attr('y', d => this.yScaler(d.key) + this.dotRadius)
      .attr('transform', `translate(0, ${-this.dotRadius * 2})`)
  }

  __updateRects (group) {
    group
      .select('rect')
      .attr(
        'width',
        d =>
          Math.abs(
            this.xScaler(d3.min(d.results)) - this.xScaler(d3.max(d.results))
          ) +
          this.dotRadius * 2
      )
      .attr('x', d => this.xScaler(d3.min(d.results)) - this.dotRadius)
      .attr('y', d => this.yScaler(d.key) + this.dotRadius)
      .attr('transform', `translate(0, ${-this.dotRadius * 2})`)
  }

  __attachEventsToCircles (categories, lines) {
    const allCircles = lines.selectAll('.circles').selectAll('circle')

    allCircles.on('mouseover', (datum, idx) => {
      this.onOverCallback(categories[idx])

      allCircles
        .interrupt() // Avoids "too late; already running" error
        .transition(this.transition)
        .attr('fill-opacity', (d, i) => (i === idx ? 1 : 0.2))
    })
    allCircles.on('mouseleave', () => {
      this.onLeaveCallback()

      allCircles
        .interrupt() // Avoids "too late; already running" error
        .transition(this.transition)
        .attr('fill-opacity', 1)
    })
  }

  __attachEventsToCirclesAndLinesGroup (group) {
    group
      .call(this.__onMouseOver.bind(this))
      .call(this.__onMouseLeave.bind(this))
  }

  __onMouseOver (group) {
    group.on('mouseover', (d, i, nodesList) => {
      const circlesAndLine = d3.select(nodesList[i])
      const lineGenerator = d3
        .line()
        .x((d, i) => this.xScaler(d.value))
        .y((d, i) => this.yScaler(d.key) - this.dotRadius * 2 * (i - 1))

      circlesAndLine
        .select('path')
        .interrupt()
        .transition(this.transition)
        .call(path =>
          path.attr('d', d =>
            lineGenerator(d.results.map(r => ({ key: d.key, value: r })))
          )
        )

      circlesAndLine
        .selectAll('circle')
        .interrupt() // Avoids "too late; already running" error
        .transition(this.transition)
        .call(circles =>
          circles.attr(
            'cy',
            (d, i) => this.yScaler(d.key) - this.dotRadius * 2 * (i - 1)
          )
        )

      circlesAndLine
        .select('rect')
        .interrupt() // Avoids "too late; already running" error
        .transition(this.transition)
        .call(rect =>
          rect
            .attr('height', this.dotRadius * 6)
            .attr('y', d => this.yScaler(d.key) - this.dotRadius)
        )
    })
  }

  __onMouseLeave (group) {
    group.on('mouseleave', (d, i, nodesList) => {
      const circlesAndLine = d3.select(nodesList[i])
      const lineGenerator = d3
        .line()
        .x((d, i) => this.xScaler(d.value))
        .y(d => this.yScaler(d.key))

      group
        .select('path')
        .interrupt() // Avoids "too late; already running" error
        .transition(this.transition)
        .call(path =>
          path.attr('d', d =>
            lineGenerator(d.results.map(r => ({ key: d.key, value: r })))
          )
        )

      circlesAndLine
        .selectAll('circle')
        .interrupt() // Avoids "too late; already running" error
        .transition(this.transition)
        .call(circles => circles.attr('cy', (d, i) => this.yScaler(d.key)))

      circlesAndLine
        .select('rect')
        .interrupt() // Avoids "too late; already running" error
        .transition(this.transition)
        .call(rect =>
          rect
            .attr('height', this.dotRadius * 2)
            .attr('y', d => this.yScaler(d.key) + this.dotRadius)
        )
    })
  }
}

export default ClevelandDotPlots
