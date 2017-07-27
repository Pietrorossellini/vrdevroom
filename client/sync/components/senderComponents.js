import {LerpComponent} from './lerpComponents'

import avatar from '../../world/avatar'
import {Sync} from '../../globals'
import {now} from '../../util/time'
import {broadcastData} from '../../comms/commsHandler'

const SyncSendComponent = {
  Self: 'sender-self',
  Pointer: 'sender-pointer',
  Card: 'sender-card'
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

const createSender = definition => Object.assign({}, Sender, definition)

const definitions = {}

definitions[SyncSendComponent.Self] = createSender({
  sync: function() {
    const pos = this.el.object3D.getWorldPosition()
    const q = this.el.object3D.getWorldQuaternion()

    const data = [
      'peer', // type
      avatar.getName(), // id / name
      pos.toArray(), // payload...
      q.toArray(),
      avatar.getSlot()
    ]

    broadcastData(data)
  }
})

definitions[SyncSendComponent.Pointer] = createSender({
  setInitialState: function() {
    this.latestPresentationState = false
  },

  isDirty: function() {
    const isPresenting = this.el.is('presenting') || this.el.is('grabbing')

    // presents or state has changed (= notify others about presentation end)
    return isPresenting || this.latestPresentationState !== isPresenting
  },

  sync: function() {
    if (!this.isDirty()) return

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
    this.latestPresentationState = isPresenting
  }
})

definitions[SyncSendComponent.Card] = createSender({
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
})

export {
  definitions,
  SyncSendComponent
}
