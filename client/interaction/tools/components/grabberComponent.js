import Bacon from 'baconjs'
import {head} from 'lodash'
import {LerpComponent} from '../../../sync/components/lerpComponents'
import {World} from '../../../globals'

export default {
  dependencies: ['raycaster', 'line'],

  init: function() {
    this.grabbedCard = null

    this.intersections = new Bacon.Bus()
    this.grabs = new Bacon.Bus()
    this.pushGrabs = event => this.grabs.push(event)

    const grabActions = this.grabs.map(v => v.detail.action).skipDuplicates()

    const grab = this.intersections.toProperty()
      .sampledBy(grabActions.filter(v => v === true))

    const release = this.intersections.toProperty()
      .sampledBy(grabActions.filter(v => v === false))

    grab
      .map(event => event.detail.els
        .filter(el => el.classList.contains('card')))
      .map(cards => head(cards))
      .filter(card => !!card)
      .onValue(card => {
        this.grabbedCard = card
        this.el.addState('grabbing')
        this.grabbedCard.addState('selected')
      })

    release
      .filter(() => this.grabbedCard)
      .onValue(() => {
        this.grabbedCard.removeState('selected')
        this.grabbedCard = null
        this.el.removeState('grabbing')
      })

    this.el.addEventListener('raycaster-intersection', this.handleIntersection.bind(this))
    this.el.addEventListener('grab', this.pushGrabs)
  },

  remove: function() {
    this.el.removeEventListener('raycaster-intersection', this.handleIntersection.bind(this))
    this.el.removeEventListener('grab', this.pushGrabs)
  },

  handleIntersection: function(event) {
    this.intersections.push(event)

    if (!this.grabbedCard) return

    const boardIntersection = head(event.detail.intersections.filter(o => o.object.el.classList.contains('board')))
    const pointedPosition = boardIntersection ? boardIntersection.point : null

    if (!pointedPosition) return

    const localPosition = boardIntersection.object.worldToLocal(pointedPosition)
    this.grabbedCard.setAttribute(LerpComponent.Card, 'position', {x: localPosition.x, y: localPosition.y, z: World.CARD_Z})
  }
}