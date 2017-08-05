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
    position: {default: ''},
    quaternion: {default: ''}
  },

  init: function() {
    this.data = {
      position: this.el.object3D.position,
      quaternion: this.el.querySelector('.avatar__head').object3D.quaternion
    }

    this.pos = new THREE.Vector3()
    this.q = new THREE.Quaternion()
  },

  tick: function(_, timeDelta) {
    const currentPos = this.el.object3D.position.setY(0)
    const currentQ = this.el.querySelector('.avatar__head').object3D.quaternion
    const targetPos = this.data.position
    const targetQ = this.data.quaternion
    const position = this.pos
    const q = this.q

    let a = timeDelta / Sync.TICK_INTERVAL

    position.copy(targetPos).sub(currentPos)
    position.multiplyScalar(a)
    this.el.setAttribute('position', currentPos.add(position))

    THREE.Quaternion.slerp(currentQ, targetQ, q, a)
    const head = this.el.querySelector('.avatar__head')
    head.object3D.setRotationFromQuaternion(q)
  }
}

definitions[LerpComponent.Pointer] = {
  schema: {
    position: {default: ''},
    direction: {default: ''}
  },

  init: function() {
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
