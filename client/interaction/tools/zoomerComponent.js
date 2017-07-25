import * as AFRAME from 'aframe'
import {head} from 'lodash'
import {ToolComponent} from './toolType'
import {TextComponent} from '../../world/cardText'

function registerZoomerComponent() {
  AFRAME.registerComponent(ToolComponent.Zoomer, {
    dependencies: ['raycaster'],

    init: function() {
      this.pointedCard = null
      this.zoomedCard = null
      this.el.addEventListener('raycaster-intersection', this.handleIntersection.bind(this))
    },

    remove: function() {
      this.el.removeEventListener('raycaster-intersection', this.handleIntersection.bind(this))
    },

    handleIntersection: function(event) {
      if (this.el.is('zooming') && !this.pointedCard) {
        this.pointedCard = head(event.detail.els.filter(el => el.classList.contains('card')))
        const board = head(event.detail.els.filter(el => el.classList.contains('board')))

        if (!this.pointedCard) return

        this.zoomedCard = document.createElement('a-entity')
        this.zoomedCard.setAttribute('geometry', {
          primitive: 'plane',
          width: 1.0,
          height: 1.0
        })
        this.zoomedCard.setAttribute('material', {
          color: 'yellow',
          opacity: 0.0
        })
        const text = this.pointedCard.components[TextComponent.Card].data.value
        this.zoomedCard.setAttribute('text', {
          value: text,
          color: 'black',
          wrapCount: Math.max(text.length / 5, 10),
          opacity: 0.0
        })

        this.zoomedCard.setAttribute('position', {
          x: this.pointedCard.components.position.data.x / 2.0,
          y: this.pointedCard.components.position.data.y / 2.0,
          z: 0.5
        })

        const fadeInBg = document.createElement('a-animation')
        fadeInBg.setAttribute('attribute', 'material.opacity')
        fadeInBg.setAttribute('dur', 300)
        fadeInBg.setAttribute('to', 0.6)

        const fadeInText = document.createElement('a-animation')
        fadeInText.setAttribute('attribute', 'text.opacity')
        fadeInText.setAttribute('dur', 500)
        fadeInText.setAttribute('to', 1.0)

        this.zoomedCard.appendChild(fadeInBg)
        this.zoomedCard.appendChild(fadeInText)

        board.appendChild(this.zoomedCard)
      }
    },

    tick: function() {
      if (!this.el.is('zooming') && this.zoomedCard) {
        this.zoomedCard.parentNode.removeChild(this.zoomedCard)
        this.pointedCard = null
        this.zoomedCard = null
      }
    }
  })
}

export {
  registerZoomerComponent
}
