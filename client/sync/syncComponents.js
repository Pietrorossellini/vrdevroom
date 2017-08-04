// TODO Encapsulate marshalling / unmarshalling

import * as AFRAME from 'aframe'

import {broadcastData} from '../comms/commsHandler'
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

const UpdateInterval = Sync.TICK_INTERVAL

const Sender = {
  init: function() {
    this.setInitialState()
    this.nextUpdateTime = now() + UpdateInterval
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
    this.nextUpdateTime = now() + UpdateInterval
  }
}

const Receiver = {
  init: function() {
    this.el.addEventListener('sync', this.doSync.bind(this))
  },

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
        q.toArray()
      ]

      broadcastData(data)
    }
  }))

  AFRAME.registerComponent(SyncSendComponent.Pointer, createSender({
    schema: {
      latestPresentationState: {type: 'boolean', default: false}
    },

    isDirty: function() {
      const isPresenting = this.el.is('presenting')
      return this.data.latestPresentationState !== isPresenting
        || isPresenting
    },

    sync: function() {
      if (!this.isDirty()) return

      const isPresenting = this.el.is('presenting')
      const pos = this.el.object3D.getWorldPosition()
      const dir = this.el.object3D.getWorldDirection().negate()

      const data = [
        'ray',
        '',
        isPresenting,
        pos.toArray(),
        dir.toArray()
      ]

      broadcastData(data)
      this.data.latestPresentationState = isPresenting
    }
  }))

  AFRAME.registerComponent(SyncSendComponent.Card, createSender({
    dependencies: ['position'],

    schema: {
      latestUpdate: {type: 'array', default: [0, 0]}
    },

    setInitialState() {
      this.data.latestUpdate = [
        this.el.components.position.data.x,
        this.el.components.position.data.y,
      ]
    },

    sync: function() {
      const {x, y} = this.el.getAttribute('position')
      if (this.data.latestUpdate[0] === x && this.data.latestUpdate[1] === y) return

      const data = [
        'card',
        this.el.id,
        [x, y]
      ]

      broadcastData(data)
      this.data.latestUpdate = [x, y]
    }
  }))

  /*
  Receivers
   */

  AFRAME.registerComponent(SyncReceiveComponent.Peer, createReceiver({
    sync: function({position, quaternion}) {
      const {x, z} = position
      const head = this.el.querySelector('.avatar__head')
      this.el.setAttribute('position', {x, y: 0, z})
      head.object3D.setRotationFromQuaternion(quaternion)
    }
  }))

  AFRAME.registerComponent(SyncReceiveComponent.Pointer, createReceiver({
    sync: function({position, direction}) {
      this.el.setAttribute('position', position)
      this.el.setAttribute('raycaster', 'direction', direction)
    },

    willDispose: function() {
      this.el.components.raycaster.intersectedEls.forEach(el =>
        el.emit('raycaster-intersected-cleared')
      )
    }
  }))

  AFRAME.registerComponent(SyncReceiveComponent.Card, createReceiver({
    dependencies: [SyncSendComponent.Card],

    sync: function({x, y}) {
      this.el.setAttribute('position', {x, y, z: 0.01})
      this.el.setAttribute(SyncSendComponent.Card, 'latestUpdate', [x, y])
    }
  }))
}

export {
  registerSyncComponents,
  SyncSendComponent,
  SyncReceiveComponent
}