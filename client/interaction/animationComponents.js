const AnimationComponent = {
  PresentationIndicator: 'presentation-indicator'
}

const definitions = {}

definitions[AnimationComponent.PresentationIndicator] = {
  init: function() {
    addEventListener('stateadded', this.handlePresentationBegin.bind(this))
    addEventListener('stateremoved', this.handlePresentationEnd.bind(this))
  },

  remove: function() {
    removeEventListener('stateadded', this.handlePresentationBegin.bind(this))
    removeEventListener('stateremoved', this.handlePresentationEnd.bind(this))
  },

  handlePresentationBegin: function(event) {
    if (event.detail.state !== 'presenting') return

    const anim = document.createElement('a-animation')
    anim.setAttribute('attribute', 'line.opacity')
    anim.setAttribute('from', 1.0)
    anim.setAttribute('to', 0.1)
    anim.setAttribute('dur', 200)
    anim.setAttribute('easing', 'ease-in')
    anim.setAttribute('direction', 'alternate')
    anim.setAttribute('repeat', 'indefinite')
    this.el.appendChild(anim)
  },

  handlePresentationEnd: function(event) {
    if (event.detail.state !== 'presenting') return

    const anim = this.el.querySelector('a-animation')
    anim.parentNode.removeChild(anim)
    this.el.setAttribute('line', 'opacity', 0.5)
  }
}

export {
  definitions,
  AnimationComponent
}
