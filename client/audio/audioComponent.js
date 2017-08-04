import * as AFRAME from 'aframe'

import {createAudioNode, getListener} from './spatialAudio'
import {Sync} from '../util/globals'
import {now} from '../util/time'

const AudioComponent = {
  SpatialSource: 'audio-spatial',
  Listener: 'audio-listener'
}

function registerAudioComponents() {
  AFRAME.registerComponent(AudioComponent.SpatialSource, {
    schema: {
      stream: {type: 'asset', default: null}
    },

    init: function() {
      this.panner = createAudioNode(this.el.id, this.data.stream)
      this.nextUpdateTime = now() + Sync.TICK_INTERVAL
    },

    tick: function() {
      if (this.shouldUpdate()) this.updatePosition()
    },

    shouldUpdate: function() {
      return now() >= this.nextUpdateTime
    },

    updatePosition: function() {
      const {x, y, z} = this.el.getAttribute('position')
      this.panner.setPosition(x, y, z)

      this.nextUpdateTime = now() + Sync.TICK_INTERVAL
    }
  })

  AFRAME.registerComponent(AudioComponent.Listener, {
    init: function() {
      this.listener = getListener()
      this.nextUpdateTime = now() + Sync.TICK_INTERVAL
    },

    tick: function() {
      if (this.shouldUpdate()) this.updateListener()
    },

    shouldUpdate: function() {
      return now() >= this.nextUpdateTime
    },

    updateListener: function() {
      const p = this.el.getAttribute('position')
      const d = this.el.object3D.getWorldDirection().negate()

      this.listener.setPosition(p.x, p.y, p.z)
      this.listener.setOrientation(
        d.x, d.y, d.z,
        0, 1, 0
      )

      this.nextUpdateTime = now() + Sync.TICK_INTERVAL
    }
  })
}

export {
  registerAudioComponents,
  AudioComponent
}
