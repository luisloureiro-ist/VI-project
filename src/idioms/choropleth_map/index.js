import Legend from '../../../assets/js/d3.legend.js'

class ChoroplethMap {
  constructor (parentSelector) {
    this.parentSelector = parentSelector
    this.chart = d3.select(this.parentSelector)
    this.transition = d3.transition().duration(200)
  }

  create (data, clickCallback, titleTextFunction) {
    this.onClickCallback = clickCallback
    this.titleTextFunction = titleTextFunction

    // Update color scale
    this.colorScale = d3.scaleQuantize(
      [d3.min(data, d => d.value), d3.max(data, d => d.value)],
      d3.schemeOranges[9]
    )

    // Draw the map
    this.chart
      .selectAll('svg #NUTS_III path')
      .attr('fill', (d, i, nodesList) => {
        const regionClicked = nodesList[i]
        const datum = data.find(
          datum =>
            datum.location === regionClicked.dataset.name &&
            datum.nuts === getNUTS(regionClicked)
        )

        return this.colorScale(datum.value)
      })
      .on('click', this.__onPathClick.bind(this))
      .on('mouseover', this.__onMouseOver.bind(this))
      .on('mouseleave', this.__onMouseLeave.bind(this))
      .select('title')
      .text((d, i, nodesList) => {
        const regionClicked = nodesList[i].parentElement
        const datum = data.find(
          datum =>
            datum.location === regionClicked.dataset.name &&
            datum.nuts === getNUTS(regionClicked)
        )

        return `Location: ${datum.location}\n\nAverage number of fires: ${datum.value}`
      })

    this.__addLegend()
  }

  //
  // Private (auxiliar) functions
  //
  __addLegend () {
    this.chart
      .append(
        () =>
          new Legend({
            color: this.colorScale,
            title: this.titleTextFunction(),
            tickFormat: 'd'
          })
      )
      .classed('svg-legend', true)
  }

  __onPathClick (d, i, nodesList) {
    const regionClicked = nodesList[i]
    const regionName = regionClicked.dataset.name
    const regionNUTS = getNUTS(regionClicked)

    // Remove class from the last selected region ...
    const selectedIdx = Array.prototype.findIndex.call(nodesList, node =>
      node.classList.contains('selected')
    )
    if (selectedIdx !== -1) {
      nodesList[selectedIdx].classList.remove('selected')
    }

    // ... append class to the newly selected region.
    regionClicked.classList.add('selected')

    d3.select(regionClicked)
      .interrupt()
      .raise()

    this.onClickCallback(regionNUTS, regionName)
  }

  __onMouseOver (d, i, nodesList) {
    this.__resetPathsStyle()

    d3.select(nodesList[i])
      .interrupt() // Avoids "too late; already running" error
      .raise()
      // "raise" is used to guarantee that the whole path is visible with the same stroke-width across the entire path.
      // Without this, adjacent paths (map regions) can overlap one another,
      // because of the order in the DOM and because of the way the map SVG is created,
      // and the one lower in this order shows a path with different stroke-width in some parts of the path
      .classed('hovered', true)

    this.chart
      .select('#NUTS_III path.selected')
      .interrupt()
      .raise()
  }

  __onMouseLeave () {
    this.__resetPathsStyle()
  }

  __resetPathsStyle () {
    this.chart
      .selectAll('#NUTS_III path')
      .interrupt() // Avoids "too late; already running" error
      .classed('hovered', false)
  }
}

function getNUTS (nodeElement) {
  let parent = nodeElement
  let parentID = ''
  while (true) {
    parent = parent.parentElement
    parentID = parent.id

    if (parentID) break
  }

  return parent.dataset.name
}

export default ChoroplethMap
