import * as AFRAME from 'aframe'

const CardAction = {
  Hover: 'card-hover'
}

function registerCardActions() {
  AFRAME.registerComponent(CardAction.Hover, {
    schema: {
      color: {default: 'red'}
    },

    init: function () {
      const data = this.data
      const card = this.el
      const originalColor = card.getAttribute('material').color

      card.addEventListener('raycaster-intersected', _ => {
        card.setAttribute('material', 'color', data.color)
      })

      card.addEventListener('raycaster-intersected-cleared', _ => {
        card.setAttribute('material', 'color', originalColor)
      })
    }
  })
}

export {
  registerCardActions,
  CardAction
}