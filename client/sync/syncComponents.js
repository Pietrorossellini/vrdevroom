// TODO Encapsulate marshalling / unmarshalling

import * as AFRAME from 'aframe'

import {broadcastData} from '../comms/commsHandler'
import {LerpComponent} from './lerp'
import avatar from '../world/avatar'
import {peers} from './state'
import {CardAction} from '../interaction/actions'
import {Sync} from '../util/globals'
import {now} from '../util/time'

const SyncSendComponent = {
  Self: 'sender-self',
  Pointer: 'sender-pointer',
  Card: 'sender-card'
}

const SyncReceiveComponent = {
  Peer: 'receiver-peer',
  Pointer: 'receiver-pointer',
  Card: 'receiver-card'
}

const Sender = {
  init: function() {
    this.setInitialState()
    this.nextUpdateTime = now()
  },

  setInitialState: function() {},

  tick: function() {
    if (this.shouldUpdate()) this.doSync()
  },

  shouldUpdate: function() {
    return now() >= this.nextUpdateTime
  },

  doSync: function() {
    this.sync()
    this.nextUpdateTime = now() + Sync.TICK_INTERVAL
  }
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

const createSender = definition => Object.assign({}, Sender, definition)
const createReceiver = definition => Object.assign({}, Receiver, definition)

function registerSyncComponents() {
  /*
  Senders
   */

  AFRAME.registerComponent(SyncSendComponent.Self, createSender({
    sync: function() {
      const pos = this.el.object3D.getWorldPosition()
      const q = this.el.object3D.getWorldQuaternion()

      const data = [
        'peer', // type
        '', // id
        pos.toArray(), // payload...
        q.toArray(),
        avatar.getSlot()
      ]

      broadcastData(data)
    }
  }))

  AFRAME.registerComponent(SyncSendComponent.Pointer, createSender({
    schema: {
      latestPresentationState: {type: 'boolean', default: false}
    },

    isDirty: function() {
      const isPresenting = this.el.is('presenting') || this.el.is('grabbing')
      return this.data.latestPresentationState !== isPresenting
        || isPresenting
    },

    sync: function() {
      // if (!this.isDirty()) return

      const isPresenting = this.el.is('presenting') || this.el.is('grabbing')
      const pos = this.el.components.raycaster.raycaster.ray.origin
      const dir = this.el.components.raycaster.raycaster.ray.direction

      const data = [
        'ray',
        '',
        isPresenting,
        pos.toArray(),
        dir.toArray()
      ]

      broadcastData(data)
      // this.data.latestPresentationState = isPresenting
    }
  }))

  AFRAME.registerComponent(SyncSendComponent.Card, createSender({
    dependencies: ['position', LerpComponent.Card],

    schema: {
      latestUpdate: {type: 'array', default: [0, 0]},
      forcedSync: {type: 'boolean', default: false},
    },

    setInitialState() {
      this.data.latestUpdate = [
        this.el.components.position.data.x,
        this.el.components.position.data.y,
      ]

      this.nextForcedUpdateTime = now() + Sync.FORCE_UPDATE_INTERVAL
      this.prevSelectionState = false
    },

    sync: function() {
      const forceUpdate = this.data.forcedSync && now() >= this.nextForcedUpdateTime
      const {x, y} = this.el.getAttribute(LerpComponent.Card).position // target position of (ongoing) interpolation
      const isSelected = this.el.is('selected')
      const hasPositionChanged = this.data.latestUpdate[0] !== x || this.data.latestUpdate[1] !== y
      const hasSelectionStateChanged = this.prevSelectionState !== isSelected

      if (!forceUpdate && !hasPositionChanged && !hasSelectionStateChanged) return

      const data = [
        'card',
        this.el.id,
        [x, y],
        isSelected
      ]

      broadcastData(data)
      this.data.latestUpdate = [x, y]
      if (forceUpdate) this.nextForcedUpdateTime = now() + Sync.FORCE_UPDATE_INTERVAL
      this.prevSelectionState = isSelected
    }
  }))

  /*
  Receivers
   */

  AFRAME.registerComponent(SyncReceiveComponent.Peer, createReceiver({
    dependencies: [LerpComponent.Avatar],

    sync: function({position, quaternion}) {
      const {x, z} = position
      this.el.setAttribute('position', {x, y: 0, z})
      this.el.setAttribute(LerpComponent.Avatar, 'quaternion', quaternion)
    }
  }))

  AFRAME.registerComponent(SyncReceiveComponent.Pointer, createReceiver({
    dependencies: [LerpComponent.Pointer],

    schema: {
      peerId: {default: null}
    },

    sync: function({position, direction, isPresenting, peerId}) {
      if (isPresenting && !this.el.getAttribute('visible')) {
        this.el.setAttribute(LerpComponent.Pointer, {position, direction})

        // There seems to be a problem setting the color beforehand, so here we make sure it's set correctly
        const color = peers.get(peerId).querySelector('.avatar__head').getAttribute('material').color
        this.el.setAttribute('line', 'color', color)

        this.el.setAttribute('raycaster', 'far', 100)
        this.el.setAttribute('visible', true)
      } else if (isPresenting) {
        this.el.setAttribute(LerpComponent.Pointer, {position, direction})
      } else if (this.el.getAttribute('visible')) {
        this.el.setAttribute('visible', false)
        this.el.setAttribute('raycaster', 'far', 0)
        this.el.removeAttribute(LerpComponent.Pointer)
      }
    }
  }))

  AFRAME.registerComponent(SyncReceiveComponent.Card, createReceiver({
    dependencies: [SyncSendComponent.Card, LerpComponent.Card],

    sync: function({x, y, isSelected, peerId}) {
      this.el.setAttribute(SyncSendComponent.Card, 'latestUpdate', [x, y])
      this.el.setAttribute(LerpComponent.Card, 'position', {x, y, z: 0.01})

      if (isSelected) {
        const color = peers.get(peerId).querySelector('.avatar__head').getAttribute('material').color
        this.el.setAttribute(CardAction.Selection, 'color', color)
        this.el.addState('selected')
      } else {
        this.el.setAttribute(CardAction.Selection, 'color', avatar.getColor())
        this.el.removeState('selected')
      }
    }
  }))
}

export {
  registerSyncComponents,
  SyncSendComponent,
  SyncReceiveComponent
}