/**
 * This class was created using the code present on the following link:
 * - https://www.simple.gy/blog/range-slider-two-handles/
 *
 * Credits to Eric Miller.
 */
class TwoHandleRangeSlider {
  constructor (rangeMinId, rangeMaxId, outputId) {
    this.min = 2009
    this.max = 2017
    this.range = this.max - this.min + 1
    this.a = document.getElementById(rangeMinId)
    this.b = document.getElementById(rangeMaxId)
    this.o = document.getElementById(outputId)

    // On an event of kind, for els, call fn
    const on = (...kinds) => (...els) => fn =>
      kinds.forEach(kind => els.forEach(el => el.addEventListener(kind, fn)))

    // 'mousedown' because otherwise you can "lock" the other slider in place at min=max=value
    on('input', 'mousedown')(this.a, this.b)(this.update.bind(this))
  }

  // As the user drags on input, update the available range and visual space for both inputs
  update ({ target } = {}) {
    let pivot // unless otherwise acted on

    if (target === this.a) {
      if (this.a.valueAsNumber >= Number(this.a.max)) {
        pivot = Math.min(this.max - 1, Number(this.a.max) + 1)
      }
    }

    if (target === this.b) {
      if (this.b.valueAsNumber <= Number(this.b.min)) {
        pivot = Math.max(this.min, Number(this.b.min) - 2)
      }
    }

    if (pivot != null) {
      this.a.max = pivot
      this.b.min = pivot + 1
    }

    this.a.style.flexGrow = this.stepsIn(this.a)
    this.b.style.flexGrow = this.stepsIn(this.b)

    // Print selected range
    this.o.innerText = `${this.a.value} - ${this.b.value}`
  }

  // Number of discrete steps in an input range
  stepsIn (el) {
    return Number(el.max) - Number(el.min) + 1
  }
}

export default TwoHandleRangeSlider
