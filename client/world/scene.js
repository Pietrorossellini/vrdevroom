import * as AFRAME from 'aframe'
import * as log from 'loglevel'

import {World} from '../util/globals'
import {self} from '../sync/state'
import {SyncSendComponent} from '../sync/components/senderComponents'
import {SyncReceiveComponent} from '../sync/components/receiverComponents'
import {LerpComponent} from '../sync/components/lerpComponents'
import {ToolComponent} from '../interaction/tools/toolComponents'
import {AudioComponent} from '../audio/audioComponents'
import {InputHandlerComponent} from '../interaction/inputHandler'
import {createBoard} from './board'
import avatar from '../world/avatar'

let scene = null

function createRoom() {
  const room = document.createElement('a-entity')

  room.setAttribute('geometry', {
    primitive: 'box',
    width: 7,
    height: 3.2,
    depth: 7
  })
  room.setAttribute('material', {
    color: '#fafafa',
    side: 'back',
    metalness: 0.1,
    roughness: 0.9
  })
  room.setAttribute('position', {x: 0, y: 1.6, z: 0})

  scene.appendChild(room)
}

function createCamera(position) {
  log.info('Creating camera with position', position)

  const {x, y, z} = position

  const camera = document.createElement('a-camera')
  camera.setAttribute('position', {x, y, z})
  camera.setAttribute(AudioComponent.Listener, '')
  camera.setAttribute(SyncSendComponent.Self, '')

  scene.appendChild(camera)
  createPointer()
}

function createPointer() {
  const isGearVr = AFRAME.utils.device.isGearVR()

  const pointer = document.createElement('a-entity')
  pointer.setAttribute('id', 'pointer')

  if (isGearVr) {
    log.info('Using GearVR. Assuming GearVR controller is available: using laser controls.')
    pointer.setAttribute('laser-controls', '')
    pointer.setAttribute(InputHandlerComponent.GearVrController, '')
    scene.appendChild(pointer)
  } else {
    log.warn('Not using GearVR: revering to cursor controls.')
    pointer.setAttribute('cursor', {rayOrigin: 'mouse'})

    const camera = document.querySelector('a-camera')
    camera.appendChild(pointer)
  }

  // TODO lift to constant

  pointer.setAttribute('line', {
    opacity: 0.3,
    color: avatar.getColor()
  })

  pointer.setAttribute('raycaster', {
    objects: '.interactive',
    recursive: false
  })

  pointer.setAttribute(SyncSendComponent.Pointer, '')
  pointer.setAttribute(ToolComponent.Grabber, '')
  pointer.setAttribute(ToolComponent.Zoomer, '')
  self.add(World.Keys.Pointer, pointer)
}

function createLighting() {
  const ambient = document.createElement('a-entity')
  ambient.setAttribute('light', {
    type: 'ambient',
    color: '#FAFAD2',
    intensity: 0.5
  })

  const point = document.createElement('a-entity')
  point.setAttribute('light', {
    type: 'point',
    color: '#FAFAD2',
    intensity: 0.9,
    distance: 5,
    decay: 1
  })
  point.setAttribute('position', {x: 0, y: 2.8, z: -1.6})

  scene.appendChild(ambient)
  scene.appendChild(point)
}

function createAvatar(id, pos, orientation, slot) {
  const {x, z} = pos
  const y = 0

  log.info(`No existing avatar for id ${id}: creating`)

  const avatar = document.createElement('a-entity')
  avatar.setAttribute('id', id)

  const head = document.createElement('a-entity')
  head.setAttribute('class', 'avatar__head')
  head.setAttribute('geometry', {
    primitive: 'sphere',
    radius: 0.1,
    phiLength: 180,
    phiStart: 180,
    segmentsHeight: 4,
    segmentsWidth: 4
  })
  head.setAttribute('material', {
    color: World.AVATAR_COLORS[slot],
    flatShading: true
  })
  head.setAttribute('position', {x: 0, y: World.USER_HEIGHT, z: 0})

  const cap = document.createElement('a-entity')
  cap.setAttribute('geometry', {
    primitive: 'circle',
    radius: 0.1,
    segments: 8
  })
  cap.setAttribute('material', {
    color: World.AVATAR_COLORS[slot],
  })
  head.appendChild(cap)

  const rod = document.createElement('a-entity')
  rod.setAttribute('geometry', {
    primitive: 'cylinder',
    radius: 0.025,
    segmentsRadial: 8,
    height: 0.2
  })
  rod.setAttribute('material', {
    color: World.AVATAR_COLORS[slot],
    flatShading: true
  })
  head.appendChild(rod)

  const body = document.createElement('a-entity')
  body.setAttribute('class', 'avatar__body')
  body.setAttribute('geometry', {
    primitive: 'cone',
    radiusTop: 0.12,
    radiusBottom: 0.08,
    height: 0.5,
    segmentsRadial: 5,
    thetaStart: 180
  })
  body.setAttribute('material', {
    color: World.AVATAR_COLORS[slot],
    flatShading: true
  })
  body.setAttribute('position', {x: 0, y: World.USER_HEIGHT - 0.45, z: 0})

  avatar.appendChild(head)
  avatar.appendChild(body)

  avatar.setAttribute('position', {x, y, z})
  avatar.setAttribute(AudioComponent.SpatialSource, '')
  head.object3D.setRotationFromQuaternion(orientation)

  scene.appendChild(avatar)
  avatar.setAttribute(LerpComponent.Avatar, '')
  avatar.setAttribute(SyncReceiveComponent.Peer, '')

  createRayCaster(id, avatar, World.AVATAR_COLORS[slot])

  return avatar
}

function createRayCaster(peerId, avatar, color) {
  const rayCaster = document.createElement('a-entity')

  rayCaster.setAttribute('class', 'avatar__raycaster')
  rayCaster.setAttribute('id', `${peerId}__raycaster`)
  rayCaster.setAttribute('raycaster', {
    showLine: true,
    objects: '.interactive',
    recursive: false
  })

  rayCaster.setAttribute('line', {
    color: new THREE.Color().setStyle(color),
    opacity: 0.5
  })

  rayCaster.setAttribute(SyncReceiveComponent.Pointer, {peerId})
  avatar.appendChild(rayCaster)
}

function removeAvatar(id) {
  const el = document.getElementById(id)
  if (!el) {
    log.warn('Tried to remove avatar but none was found for client ID', id)
    return
  }
  el.parentNode.removeChild(el)

  log.info(`Removed avatar ${id} from scene`)
}

function createScene() {
  log.info('Creating scene')

  scene = document.querySelector('a-scene')

  createRoom()
  createLighting()

  scene.appendChild(createBoard())
}

export {
  createScene,
  createCamera,
  createAvatar,
  removeAvatar,
  createRayCaster
}