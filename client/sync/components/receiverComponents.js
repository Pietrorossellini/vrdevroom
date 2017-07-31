import {SyncSendComponent} from './senderComponents'
import {LerpComponent} from './lerpComponents'
import {CardActionComponent} from '../../interaction/actionComponents'

import {peers} from '../ElementStore'
import {World} from '../../globals'
import avatar from '../../world/avatar'

const SyncReceiveComponent = {
  Peer: 'receiver-peer',
  Pointer: 'receiver-pointer',
  Card: 'receiver-card'
}

const Receiver = {
  init: function() {
    this.setInitialState()
    this.el.addEventListener('sync', this.doSync.bind(this))
  },

  setInitialState: function() {},

  remove: function() {
    this.el.removeEventListener('sync', this.doSync.bind(this))
  },

  doSync: function(event) {
    this.sync(event.detail)
  }
}

const createReceiver = definition => Object.assign({}, Receiver, definition)

const definitions = {}

definitions[SyncReceiveComponent.Peer] = createReceiver({
  dependencies: [LerpComponent.Avatar],

  sync: function({position, quaternion}) {
    this.el.setAttribute(LerpComponent.Avatar, {position: position.setY(0), quaternion})
  }
})

definitions[SyncReceiveComponent.Pointer] = createReceiver({
  dependencies: [LerpComponent.Pointer],

  schema: {
    peerId: {type: 'string', default: ''}
  },

  sync: function({position, direction, isPresenting, peerId}) {
    if (isPresenting && !this.el.getAttribute('visible')) {
      this.el.setAttribute(LerpComponent.Pointer, {position, direction})

      // There seems to be a problem setting the color beforehand, so here we make sure it's set correctly
      const color = peers.get(peerId).querySelector('.avatar__head').getAttribute('material').color
      this.el.setAttribute('line', 'color', color)

      this.el.setAttribute('raycaster', {
        far: 100,
        interval: 17
      })
      this.el.setAttribute('visible', true)
    } else if (isPresenting) {
      this.el.setAttribute(LerpComponent.Pointer, {position, direction})
    } else if (this.el.getAttribute('visible')) {
      this.el.setAttribute('visible', false)
      this.el.removeAttribute(LerpComponent.Pointer)
      this.el.setAttribute('raycaster', {
        far: 0,
        interval: 100
      })
    }
  }
})

definitions[SyncReceiveComponent.Card] = createReceiver({
  dependencies: [SyncSendComponent.Card, LerpComponent.Card],

  sync: function({x, y, isSelected, peerId}) {
    this.el.setAttribute(SyncSendComponent.Card, 'latestUpdate', [x, y])
    this.el.setAttribute(LerpComponent.Card, 'position', {x, y, z: World.CARD_Z})

    if (isSelected) {
      const color = peers.get(peerId).querySelector('.avatar__head').getAttribute('material').color
      this.el.setAttribute(CardActionComponent.Selection, 'color', color)
      this.el.addState('selected')
    } else {
      this.el.setAttribute(CardActionComponent.Selection, 'color', avatar.getColor())
      this.el.removeState('selected')
    }
  }
})

export {
  definitions,
  SyncReceiveComponent
}
