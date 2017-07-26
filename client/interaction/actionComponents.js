const CardActionComponent = {
  Hover: 'card-hover',
  Selection: 'card-selection'
}

const definitions = {}

definitions[CardActionComponent.Hover] = {
  init: function () {
    const card = this.el
    this.color = 'green'
    const origColor = card.getAttribute('material').color

    card.addEventListener('raycaster-intersected', event => {
      if (!card.is('selected')) {
        this.color = event.detail.el.components.line.material.color
        card.addState('focused')
      }
    })

    card.addEventListener('raycaster-intersected-cleared', _ => {
      if (!card.is('selected')) {
        card.removeState('focused')
      }
    })

    card.addEventListener('stateadded', event => {
      if (event.detail.state === 'focused') {
        card.setAttribute('material', {
          color: this.color
        })
      }
    })

    card.addEventListener('stateremoved', event => {
      if (event.detail.state === 'focused') {
        card.setAttribute('material', {
          color: origColor
        })
      }
    })
  }
}

definitions[CardActionComponent.Selection] = {
  schema: {
    color: {default: 'red'}
  },

  init: function () {
    const card = this.el
    const material = card.getAttribute('material')
    const origColor = material.color
    const origOpacity = material.opacity

    card.addEventListener('stateadded', event => {
      if (event.detail.state === 'selected') {
        card.removeState('focused')
        card.setAttribute('material', {
          opacity: 0.3,
          color: this.data.color
        })
      }
    })

    card.addEventListener('stateremoved', event => {
      if (event.detail.state === 'selected') {
        card.setAttribute('material', {
          opacity: origOpacity,
          color: origColor
        })
      }
    })
  }
}

export {
  definitions,
  CardActionComponent
}