import {World} from '../globals'

const AnimationComponent = {
  PresentationIndicator: 'presentation-indicator'
}

const definitions = {}

definitions[AnimationComponent.PresentationIndicator] = {
  dependencies: ['line', 'look-at'],

  init: function() {
    this.indicator = null

    addEventListener('stateadded', this.handlePresentationBegin.bind(this))
    addEventListener('stateremoved', this.handlePresentationEnd.bind(this))
  },

  remove: function() {
    removeEventListener('stateadded', this.handlePresentationBegin.bind(this))
    removeEventListener('stateremoved', this.handlePresentationEnd.bind(this))
  },

  handlePresentationBegin: function(event) {
    if (event.detail.state !== 'presenting' && event.detail) return

    this.el.setAttribute('line', 'opacity', 1.0)
    this.indicator = createIndicator()
    document.querySelector('a-scene').appendChild(this.indicator)
  },

  handlePresentationEnd: function(event) {
    if (event.detail.state !== 'presenting') return

    this.el.setAttribute('line', 'opacity', 0.5)
    document.querySelector('a-scene').removeChild(this.indicator)
    this.indicator = null
  }
}

function createIndicator() {
  const indicator = document.createElement('a-entity')

  indicator.setAttribute('geometry', {
    primitive: 'ring',
    radiusOuter: 0.025,
    radiusInner: 0.01
  })
  indicator.setAttribute('material', {
    color: 'red',
    opacity: 0.0
  })
  indicator.setAttribute('position', {
    x: World.BOARD_POS.x,
    y: 0.65,
    z: World.BOARD_POS.y + 1
  })

  const text = document.createElement('a-text')
  text.setAttribute('value', 'Presenting')
  text.setAttribute('width', 2)
  text.setAttribute('position', {
    x: 0,
    y: -0.1,
    z: 0
  })
  text.setAttribute('align', 'center')
  text.setAttribute('color', 'red')

  const indicatorAnim = document.createElement('a-animation')
  indicatorAnim.setAttribute('attribute', 'material.opacity')
  indicatorAnim.setAttribute('from', 0.0)
  indicatorAnim.setAttribute('to', 0.5)
  indicatorAnim.setAttribute('dur', 2000)
  indicatorAnim.setAttribute('easing', 'ease-out')
  indicatorAnim.setAttribute('direction', 'alternate')
  indicatorAnim.setAttribute('repeat', 'indefinite')

  const textAnim = document.createElement('a-animation')
  textAnim.setAttribute('attribute', 'opacity')
  textAnim.setAttribute('from', 0.2)
  textAnim.setAttribute('to', 0.4)
  textAnim.setAttribute('dur', 4000)
  textAnim.setAttribute('easing', 'ease-out')
  textAnim.setAttribute('direction', 'alternate')
  textAnim.setAttribute('repeat', 'indefinite')

  text.appendChild(textAnim)
  indicator.appendChild(indicatorAnim)
  indicator.appendChild(text)
  indicator.setAttribute('look-at', '[camera]')

  return indicator
}

export {
  definitions,
  AnimationComponent
}
