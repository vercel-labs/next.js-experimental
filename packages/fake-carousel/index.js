'use strict'
const React = require('react')

// Simulates a popular carousel library's React wrapper that constructs its
// instance during render and stamps it with the current time.
class CarouselEngine {
  constructor() {
    this.createdAt = Date.now()
  }
}

function Carousel({ children }) {
  const engine = new CarouselEngine()
  return React.createElement(
    'div',
    { 'data-carousel-created-at': engine.createdAt },
    children
  )
}

module.exports = { Carousel }
