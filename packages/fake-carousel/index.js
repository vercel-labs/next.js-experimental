'use client'
const React = require('react')

// Mimics a popular carousel library that creates its instance during render
// and stamps it with a timestamp (e.g. for autoplay timing / unique ids).
class CarouselEngine {
  constructor() {
    this.createdAt = Date.now()
    this.id = 'carousel-' + new Date().getTime()
  }
}

function Carousel({ children }) {
  const engine = new CarouselEngine()
  return React.createElement(
    'div',
    { 'data-carousel-id': engine.id, className: 'carousel' },
    children
  )
}

module.exports = { Carousel }
