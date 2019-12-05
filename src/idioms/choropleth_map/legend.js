/**
 * Code obtained from: https://observablehq.com/@d3/color-legend
 */

class Legend {
  constructor ({
    color,
    title,
    tickSize = 6,
    width = 320,
    height = 44 + tickSize,
    // width = 44 + tickSize,
    // height = 320,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    // marginTop = 0,
    // marginRight = 16 + tickSize,
    // marginBottom = 0,
    // marginLeft = 18,
    ticks = width / 64,
    tickFormat,
    tickValues
  } = {}) {
    const svg = d3
      .create('svg')
      .attr('width', width)
      .attr('height', height)
      // .attr('viewBox', [0, 0, width, height])
      .style('overflow', 'visible')
    // .style('display', 'block')

    let x
    // let y

    // Continuous
    if (color.interpolator) {
      x = Object.assign(
        // y = Object.assign(
        color
          .copy()
          .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        // .interpolator(d3.interpolateRound(marginTop, height - marginBottom)),
        {
          range () {
            return [marginLeft, width - marginRight]
            // return [marginTop, height - marginBottom]
          }
        }
      )

      svg
        .append('image')
        .attr('x', marginLeft)
        .attr('y', marginTop)
        .attr('width', width - marginLeft - marginRight)
        .attr('height', height - marginTop - marginBottom)
        .attr('preserveAspectRatio', 'none')
        .attr('xlink:href', ramp(color.interpolator()).toDataURL())

      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        // if (!y.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1)
          tickValues = d3
            .range(n)
            .map(i => d3.quantile(color.domain(), i / (n - 1)))
        }
        if (typeof tickFormat !== 'function') {
          tickFormat = d3.format(tickFormat === undefined ? ',f' : tickFormat)
        }
      }
    } else if (color.invertExtent) {
      // Discrete
      const thresholds = color.thresholds
        ? color.thresholds() // scaleQuantize
        : color.quantiles
          ? color.quantiles() // scaleQuantile
          : color.domain() // scaleThreshold

      const thresholdFormat =
        tickFormat === undefined
          ? d => d
          : typeof tickFormat === 'string'
            ? d3.format(tickFormat)
            : tickFormat

      x = d3
        // y = d3
        .scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight])
      // .rangeRound([marginTop, height - marginBottom])

      svg
        .append('g')
        .selectAll('rect')
        .data(color.range())
        .join('rect')
        .attr('x', (d, i) => x(i - 1))
        .attr('y', marginTop)
        .attr('width', (d, i) => x(i) - x(i - 1))
        .attr('height', height - marginTop - marginBottom)
        // .attr('x', marginLeft)
        // .attr('y', (d, i) => y(i - 1))
        // .attr('width', width - marginLeft - marginRight)
        // .attr('height', (d, i) => y(i) - y(i - 1))
        .attr('fill', d => d)

      tickValues = d3.range(thresholds.length)
      tickFormat = i => thresholdFormat(thresholds[i], i)
    }

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - marginBottom})`)
      // .attr('transform', `translate(${width - marginRight}, 0)`)
      .call(
        d3
          .axisBottom(x)
          // .axisRight(y)
          .ticks(ticks, typeof tickFormat === 'string' ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === 'function' ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(tickValues)
      )
      .call(
        g =>
          g
            .selectAll('.tick line')
            .attr('y1', marginTop + marginBottom - height)
        // g.selectAll('.tick line').attr('x1', marginLeft + marginRight - width)
      )
      .call(g => g.select('.domain').remove())
      .call(g =>
        g
          .append('text')
          .attr('y', marginTop + marginBottom - height - 6)
          // .attr('x', marginLeft + marginRight - width - 6)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .attr('font-weight', 'bold')
          .text(title)
      )

    return svg.node()
  }
}

function ramp (color, n = 256) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1))
    context.fillRect(i, 0, 1, 1)
  }
  return canvas
}

export default Legend
