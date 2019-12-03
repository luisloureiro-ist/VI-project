class ChoroplethMap {
  constructor (parentSelector) {
    this.parentSelector = parentSelector
    this.chart = d3.select(this.parentSelector).select('svg')
    this.transition = d3.transition().duration(200)
  }

  create () {
    // Draw the map
    this.chart
      .selectAll('#NUTS_II path')
      .attr('fill', 'orange')
      .style('opacity', 0.8)
      .on('mouseover', this.__onMouseOver.bind(this))
      .on('mouseleave', this.__onMouseLeave.bind(this))
  }

  //
  // Private (auxiliar) functions
  //
  __onMouseOver (d, i, nodesList) {
    this.chart
      .selectAll('#NUTS_II path')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('opacity', 0.5)
    d3.select(nodesList[i])
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('opacity', 0.8)
      .style('stroke', 'black')
  }

  __onMouseLeave (d, i, nodesList) {
    this.chart
      .selectAll('#NUTS_II path')
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('opacity', 0.8)
    d3.select(nodesList[i])
      .interrupt() // Avoids "too late; already running" error
      .transition(this.transition)
      .style('stroke', 'inherit')
  }
}

export default ChoroplethMap
