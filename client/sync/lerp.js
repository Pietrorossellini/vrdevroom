import * as AFRAME from 'aframe'
import {Sync} from '../util/globals'
import {now} from '../util/time'

// TODO Generalize

const LerpComponent = {
  Avatar: 'lerp-avatar',
  Pointer: 'lerp-pointer',
  Card: 'lerp-card'
}

function registerLerpComponents() {
  AFRAME.registerComponent(LerpComponent.Avatar, {
    schema: {
      quaternion: {type: 'string', default: ''} // no parsing
    },

    init: function() {
      this.prev = this.data = this.el.querySelector('.avatar__head').object3D.quaternion
      this.a = 0
      this.q = new THREE.Quaternion()
    },

    update: function(oldData) {
      this.prev.quaternion = oldData.quaternion || new THREE.Quaternion()
      this.a = 0
    },

    tick: function(_, timeDelta) {
      this.a += timeDelta / Sync.TICK_INTERVAL
      THREE.Quaternion.slerp(this.prev.quaternion, this.data.quaternion, this.q, this.a <= 1.0 ? this.a : 1.0)

      const head = this.el.querySelector('.avatar__head')
      head.object3D.setRotationFromQuaternion(this.q)
    }
  })

  AFRAME.registerComponent(LerpComponent.Pointer, {
    schema: {
      position: {type: 'string', default: ''},
      direction: {type: 'string', default: ''}
    },

    init: function() {
      this.prev = this.data
      this.a = 0
      this.pos = new THREE.Vector3()
      this.dir = new THREE.Vector3()
    },

    update: function(oldData) {
      this.prev.position = oldData.position || this.prev.position
      this.prev.direction = oldData.direction || this.prev.direction
      this.a = 0
    },

    tick: function(_, timeDelta) {
      this.a += timeDelta / Sync.TICK_INTERVAL
      this.a = this.a <= 1.0 ? this.a : 1.0
      this.pos.lerpVectors(this.prev.position, this.data.position, this.a)
      this.dir.lerpVectors(this.prev.direction, this.data.direction, this.a)
      this.el.setAttribute('position', this.pos)
      this.el.setAttribute('raycaster', 'direction', this.dir)
    }
  })

  AFRAME.registerComponent(LerpComponent.Card, {
    schema: {
      position: {type: 'string', default: ''}
    },

    init: function() {
      this.prev = this.data = {position: this.el.object3D.position}
      this.prevUpdateTime = now()
      this.updateInterval = 0
      this.a = 0
      this.pos = new THREE.Vector3()
    },

    update: function(oldData) {
      this.prev.position = oldData.position || this.prev.position
      this.el.setAttribute('position', this.prev.position)
      this.a = 0
      this.updateInterval = now() - this.prevUpdateTime
      this.prevUpdateTime = now()
    },

    tick: function(_, timeDelta) {
      this.a += timeDelta / this.updateInterval
      this.a = this.a <= 1.0 ? this.a : 1.0
      this.pos.lerpVectors(this.prev.position, this.data.position, this.a)
      this.el.object3D.position.set(
        this.pos.x,
        this.pos.y,
        this.pos.z
      )
    }
  })
}

export {
  registerLerpComponents,
  LerpComponent
}
