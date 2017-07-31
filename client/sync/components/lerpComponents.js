import {Sync} from '../../globals'
import {now} from '../../util/time'

const LerpComponent = {
  Avatar: 'lerp-avatar',
  Pointer: 'lerp-pointer',
  Card: 'lerp-card'
}

const definitions = {}

definitions[LerpComponent.Avatar] = {
  schema: {
    quaternion: {default: ''}
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
}

definitions[LerpComponent.Pointer] = {
  schema: {
    position: {default: ''},
    direction: {default: ''}
  },

  init: function() {
    this.el.setAttribute('position', this.data.position)
    this.el.setAttribute('raycaster', 'direction', this.data.direction)

    this.data = {
      position: this.el.object3D.position,
      direction: this.el.components.raycaster.raycaster.ray.direction
    }

    this.pos = new THREE.Vector3()
    this.dir = new THREE.Vector3()
  },

  tick: function(_, timeDelta) {
    const currentPos = this.el.object3D.position
    const currentDir = this.el.components.raycaster.raycaster.ray.direction
    const targetPos = this.data.position
    const targetDir = this.data.direction
    const position = this.pos
    const direction = this.dir

    let a = timeDelta / Sync.TICK_INTERVAL
    position.copy(targetPos).sub(currentPos)
    direction.copy(targetDir).sub(currentDir)

    position.multiplyScalar(a)
    direction.multiplyScalar(a)

    this.el.setAttribute('position', currentPos.add(position))
    this.el.setAttribute('raycaster', 'direction', {
      x: currentDir.x + direction.x,
      y: currentDir.y + direction.y,
      z: currentDir.z + direction.z,
    })
  }
}

definitions[LerpComponent.Card] = {
  schema: {
    position: {default: ''}
  },

  init: function() {
    this.data = {position: this.el.object3D.position}
    this.pos = new THREE.Vector3()
    this.smoothing = 0.5
  },

  tick: function(_, timeDelta) {
    const currentPos = this.el.object3D.position
    const targetPos = this.data.position
    const position = this.pos
    const smoothing = this.smoothing

    let a = timeDelta / Sync.TICK_INTERVAL
    position.copy(targetPos).sub(currentPos)
    position.multiplyScalar(a * smoothing)

    this.el.setAttribute('position', currentPos.add(position))
  }
}

export {
  definitions,
  LerpComponent
}
