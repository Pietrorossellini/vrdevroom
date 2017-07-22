import * as AFRAME from 'aframe'
import {Sync} from '../util/globals'

const LerpComponent = {
  Avatar: 'lerp-avatar',
  Pointer: 'lerp-pointer'
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

    tick: function(time, timeDelta) {
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

    tick: function(time, timeDelta) {
      this.a += timeDelta / Sync.TICK_INTERVAL
      const pos = this.pos.lerpVectors(this.prev.position, this.data.position, this.a)
      const dir = this.dir.lerpVectors(this.prev.direction, this.data.direction, this.a)
      this.el.setAttribute('position', pos)
      this.el.setAttribute('raycaster', 'direction', dir)
    }
  })
}

export {
  registerLerpComponents,
  LerpComponent
}
