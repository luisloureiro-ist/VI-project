import Legend from '../../../assets/js/d3.legend.js'

class RadarChart {
  constructor (
    parentSelector,
    chartWidth,
    chartHeight,
    onMouseOverAxisTextCallback,
    onMouseLeaveAxisTextCallback
  ) {
    const legendHeight = 50
    const paddingForText = 6 // Equivalent to half of the height of the text elements

    this.parentSelector = parentSelector
    this.chartSize = {
      width: chartWidth,
      height: chartHeight - legendHeight
    }
    // To guarantee that the chart has a perfect circular shape
    const shortestMeasure = Math.min(
      this.chartSize.width,
      this.chartSize.height
    )
    this.radarCenterCoordinates = {
      width: Math.round(shortestMeasure / 2) - paddingForText,
      height: Math.round(shortestMeasure / 2) - paddingForText
    }
    this.sectionElement = d3.select(this.parentSelector)
    this.chartRadius = Math.min(chartHeight, chartWidth)
    this.transition = d3
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
    this.colors = d3.schemeOranges
    this.nrOfScaleValues = 5
    this.categories = []
    this.onOverCallback = onMouseOverAxisTextCallback
    this.onLeaveCallback = onMouseLeaveAxisTextCallback
  }

  create (data, categories, titleTextFunction) {
    this.titleTextFunction = titleTextFunction
    this.categories = categories
    const chart = this.sectionElement
      .append('svg')
      .classed('svg-chart radar', true)
      .attr('width', this.chartSize.width)
      .attr('height', this.chartSize.height)

    const polygonData = data.reduce((prev, curr) => prev.concat(curr.value), [])
    const maxValue = calcMaxValue(polygonData)

    chart
      // Create axes
      .call(this.__createAxes.bind(this, data))
      // Add text to axes
      .call(this.__addTextToAxes.bind(this, data))
      // Create polygon / area
      .call(this.__createPolygon.bind(this, [polygonData], maxValue))
      // Add circles to intersection points between polygon and axes
      .call(this.__addIntersectionPoints.bind(this, data, maxValue))
      // Append scale values to the first axis
      .call(this.__addScaleValues.bind(this, maxValue))
      // Add a circumference for each scale value
      .call(this.__addCircumferences.bind(this))

    this.__createLegend(this.categories)
  }

  updateData (newData, categories = null, titleTextFunction = null) {
    this.titleTextFunction = titleTextFunction || this.titleTextFunction
    this.categories = categories || this.categories
    const newPolygonData = newData.reduce(
      (prev, curr) => prev.concat(curr.value),
      []
    )
    const newMaxValue = calcMaxValue(newPolygonData)

    d3.select(this.parentSelector)
      .selectAll('.svg-chart.radar')
      // Update polygon / area
      .call(this.__updatePolygon.bind(this, [newPolygonData], newMaxValue))
      // Update intersection circles
      .call(this.__updateIntersectionPoints.bind(this, newData, newMaxValue))
      // Update scale values
      .call(this.__updateScaleValues.bind(this, newMaxValue))

    this.__updateLegend(this.categories)
  }

  __createAxes (data, chart) {
    chart
      .append('g')
      .classed('axes', true)
      .selectAll('line')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', this.radarCenterCoordinates.width)
      .attr('x2', (d, i) =>
        calcMostDistantFromCenterXCoordinateOfItem(
          this.radarCenterCoordinates.width,
          data.length,
          i
        )
      )
      .attr('y1', this.radarCenterCoordinates.height)
      .attr('y2', (d, i) =>
        calcMostDistantFromCenterYCoordinateOfItem(
          this.radarCenterCoordinates.height,
          data.length,
          i
        )
      )
  }

  __addTextToAxes (data, chart) {
    chart
      .select('.axes')
      .append('g')
      .classed('labels', true)
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(d => d.axis)
      .attr(
        'dx',
        // Center align text in relation to axis
        (d, i, nodesList) => -nodesList[i].getBoundingClientRect().width / 2
      )
      .attr(
        'transform',
        (d, i) =>
          `translate(${calcMostDistantFromCenterXCoordinateOfItem(
            this.radarCenterCoordinates.width,
            data.length,
            i
          )}, ${calcMostDistantFromCenterYCoordinateOfItem(
            this.radarCenterCoordinates.height,
            data.length,
            i
          )})`
      )
      .attr('dominant-baseline', (d, i) =>
        isInUpperQuadrants(data.length, i) ? 'auto' : 'hanging'
      )
      .call(this.__onMouseOver.bind(this))
      .call(this.__onMouseLeave.bind(this))
  }

  __createPolygon (data, maxValue, chart) {
    chart
      .append('g')
      .classed('area', true)
      .selectAll('polygon')
      .data(data)
      .enter()
      .append('polygon')
      .attr('points', d =>
        convertToPointsString(this.radarCenterCoordinates, d, maxValue)
      )
  }

  __updatePolygon (newData, newMaxValue, chart) {
    chart
      .selectAll('.area polygon')
      .data(newData)
      .join(
        enter => enter,
        update =>
          update
            .interrupt() // Avoids "too late; already running" error
            .transition(this.transition)
            .attr('points', d =>
              convertToPointsString(this.radarCenterCoordinates, d, newMaxValue)
            )
      )
  }

  __addIntersectionPoints (data, maxValue, chart) {
    chart
      .select('.area')
      .append('g')
      .classed('values', true)
      .selectAll('circles')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) =>
        calcXCoordinate(
          d.value,
          maxValue,
          i,
          data.length,
          this.radarCenterCoordinates.width
        )
      )
      .attr('cy', (d, i) =>
        calcYCoordinate(
          d.value,
          maxValue,
          i,
          data.length,
          this.radarCenterCoordinates.height
        )
      )
      .attr('r', 3)
      .append('title')
      .text(d => this.titleTextFunction(d.axis, d.value))
  }

  __updateIntersectionPoints (newData, newMaxValue, chart) {
    chart
      .selectAll('.area .values circle')
      .data(newData)
      .join(
        enter => enter,
        update =>
          update
            .interrupt() // Avoids "too late; already running" error
            .transition(this.transition)
            .attr('cx', (d, i) =>
              calcXCoordinate(
                d.value,
                newMaxValue,
                i,
                newData.length,
                this.radarCenterCoordinates.width
              )
            )
            .attr('cy', (d, i) =>
              calcYCoordinate(
                d.value,
                newMaxValue,
                i,
                newData.length,
                this.radarCenterCoordinates.height
              )
            )
            .selection()
            .select('title')
            .text(d => this.titleTextFunction(d.axis, d.value))
      )
  }

  __addScaleValues (maxValue, chart) {
    const scales = []
    for (let i = 1; i < this.nrOfScaleValues; i++) {
      scales.push({
        value: maxValue * (i / this.nrOfScaleValues),
        y:
          this.radarCenterCoordinates.height -
          (this.radarCenterCoordinates.height * i) / this.nrOfScaleValues
      })
    }
    chart
      .select('.axes')
      .append('g')
      .classed('scale-values', true)
      .selectAll('.scale-value')
      .data(scales)
      .enter()
      .append('text')
      .classed('scale-value', true)
      .text(d => d.value)
      .attr('dominant-baseline', 'hanging')
      .attr('x', this.radarCenterCoordinates.width)
      .attr('y', this.radarCenterCoordinates.height)
      .transition(this.transition)
      .attr('y', d => d.y)
  }

  __updateScaleValues (newMaxValue, chart) {
    const scales = []
    for (let i = 1; i < this.nrOfScaleValues; i++) {
      scales.push(newMaxValue * (i / this.nrOfScaleValues))
    }

    chart
      .selectAll('.axes .scale-values .scale-value')
      .data(scales)
      .join(
        enter => enter,
        update => update.text(d => d)
      )
  }

  __addCircumferences (chart) {
    chart
      .append('g')
      .classed('circular-scales', true)
      .call(chart => {
        for (let i = 1; i <= this.nrOfScaleValues; i++) {
          chart
            .append('circle')
            .attr('cx', this.radarCenterCoordinates.width)
            .attr('cy', this.radarCenterCoordinates.height)
            .transition(this.transition)
            .attr('r', (this.radarCenterCoordinates.height * i) / 5)
        }
        return chart
      })
  }

  __onMouseOver (axesTexts) {
    axesTexts.on('mouseover', d => this.onOverCallback(d.axis))
  }

  __onMouseLeave (axesTexts) {
    axesTexts.on('mouseleave', () => this.onLeaveCallback())
  }

  __createLegend (categories) {
    this.sectionElement
      .append(
        () =>
          new Legend({
            color: d3.scaleThreshold(
              [categories[0], 'and', categories[categories.length - 1]],
              [
                this.colors[4][3],
                this.colors[4][3],
                this.colors[4][3],
                this.colors[4][3]
              ]
            ),
            title: 'Average number per year between:',
            width: 108
          })
      )
      .classed('svg-legend radar', true)
  }

  __updateLegend (categories) {
    this.sectionElement.select('.svg-legend.radar').remove()

    this.__createLegend(categories)
  }
}

function calcMaxValue (values) {
  const max = Math.max(...values)
  const orderOfMagnitude = Math.floor(Math.log10(max))
  return (
    Math.round((max / Math.pow(10, orderOfMagnitude)) * (1 + 0.2)) * // 0.2 for padding
    Math.pow(10, orderOfMagnitude)
  )
}

function isInUpperQuadrants (numberOfItems, itemIdx) {
  const degrees = Math.round(360 / numberOfItems) * itemIdx
  return degrees > 270 || degrees < 90
}

function convertToRadians (numberOfItems, idx) {
  return ((180 / numberOfItems) * idx * 2 * Math.PI) / 180
}

function calcMostDistantFromCenterXCoordinateOfItem (
  maxWidth,
  numItems,
  itemIdx
) {
  return Math.round(
    (1 + Math.sin(convertToRadians(numItems, itemIdx))) * maxWidth
  )
}

function calcMostDistantFromCenterYCoordinateOfItem (
  maxHeight,
  numItems,
  itemIdx
) {
  return Math.round(
    (1 - Math.cos(convertToRadians(numItems, itemIdx))) * maxHeight
  )
}

function calcXCoordinate (value, maxValue, idx, numberOfValues, width) {
  const ratio = value / maxValue
  const axisCoordinates = {
    start: {
      x: width
    },
    end: {
      x: calcMostDistantFromCenterXCoordinateOfItem(width, numberOfValues, idx)
    }
  }
  return (
    Math.round((axisCoordinates.end.x - axisCoordinates.start.x) * ratio) +
    axisCoordinates.start.x
  )
}

function calcYCoordinate (value, maxValue, idx, numberOfValues, height) {
  const ratio = value / maxValue
  const axisCoordinates = {
    start: {
      y: height
    },
    end: {
      y: calcMostDistantFromCenterYCoordinateOfItem(height, numberOfValues, idx)
    }
  }
  return (
    Math.round((axisCoordinates.end.y - axisCoordinates.start.y) * ratio) +
    axisCoordinates.start.y
  )
}

function convertToPointsString (
  chartCenterCoordinates,
  arrayWithValues,
  maxValue
) {
  return arrayWithValues
    .map((value, idx) => {
      return `${calcXCoordinate(
        value,
        maxValue,
        idx,
        arrayWithValues.length,
        chartCenterCoordinates.width
      )}, ${calcYCoordinate(
        value,
        maxValue,
        idx,
        arrayWithValues.length,
        chartCenterCoordinates.height
      )}`
    })
    .join(' ')
}

export default RadarChart
