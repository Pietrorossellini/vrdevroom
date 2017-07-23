import * as AFRAME from 'aframe'
import * as log from 'loglevel'

import {World} from '../util/globals'
import {self} from '../sync/state'
import {
  registerSyncComponents,
  SyncSendComponent,
  SyncReceiveComponent
} from '../sync/syncComponents'
import {LerpComponent, registerLerpComponents} from '../sync/lerp'
import {ToolComponent} from '../interaction/tools/toolType'
import {registerGrabberComponent} from '../interaction/tools/grabberComponent'
import {registerZoomerComponent} from '../interaction/tools/zoomerComponent'
import {
  registerAudioComponents,
  AudioComponent
} from '../audio/audioComponent'
import {InputHandlerComponent} from '../interaction/inputHandler'
import {createBoard} from './board'

let scene = null

function createRoom() {
  const room = document.createElement('a-entity')

  room.setAttribute('geometry', {
    primitive: 'box',
    width: 5,
    height: 3.2,
    depth: 5
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
    scene.appendChild(pointer)
  } else {
    log.warn('Not using GearVR: revering to cursor controls.')
    pointer.setAttribute('cursor', '')
    pointer.setAttribute('position', {x: 0, y: 0, z: -0.2})
    pointer.setAttribute('geometry', {
      primitive: 'circle',
      radius: 0.002
    })
    pointer.setAttribute('material', {
      color: 'yellow',
      shader: 'flat'
    })
    pointer.setAttribute('raycaster', {objects: '.interactive'})

    const camera = document.querySelector('a-camera')
    camera.appendChild(pointer)
  }

  if (isGearVr) pointer.setAttribute(InputHandlerComponent.GearVrController, '')

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
  point.setAttribute('position', {x: 0, y: 2.5, z: -2.0})

  scene.appendChild(ambient)
  scene.appendChild(point)
}

function createAvatar(id, pos, orientation) {
  const {x, z} = pos
  const y = 0

  log.info(`No existing avatar for id ${id}: creating`)

  const avatar = document.createElement('a-entity')
  avatar.setAttribute('id', id)

  const head = document.createElement('a-entity')
  head.setAttribute('class', 'avatar__head')
  head.setAttribute('geometry', {
    primitive: 'box',
    width: 0.16,
    height: 0.16,
    depth: 0.16
  })
  head.setAttribute('material', 'color', '#ffffff')
  head.setAttribute('position', {x: 0, y: World.USER_HEIGHT, z: 0})

  const body = document.createElement('a-entity')
  body.setAttribute('geometry', {
    primitive: 'cone',
    radiusTop: 0,
    radiusBottom: 0.2,
    height: 0.5
  })
  body.setAttribute('material', 'color', '#ffffff')
  body.setAttribute('position', {x: 0, y: World.USER_HEIGHT - 0.25, z: 0})

  avatar.appendChild(head)
  avatar.appendChild(body)

  avatar.setAttribute('position', {x, y, z})
  avatar.setAttribute(AudioComponent.SpatialSource, '')
  head.object3D.setRotationFromQuaternion(orientation)

  scene.appendChild(avatar)
  avatar.setAttribute(LerpComponent.Avatar, '')
  avatar.setAttribute(SyncReceiveComponent.Peer, '')

  return avatar
}

function createRayCaster(avatar, position, direction) {
  const rayCaster = document.createElement('a-entity')

  rayCaster.setAttribute('class', 'avatar__raycaster')
  rayCaster.setAttribute('position', position)
  rayCaster.setAttribute('raycaster', {
    showLine: true,
    objects: '.interactive',
    direction
  })

  rayCaster.setAttribute(LerpComponent.Pointer, {position, direction})
  rayCaster.setAttribute(SyncReceiveComponent.Pointer, '')
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
  registerSyncComponents()
  registerAudioComponents()
  registerLerpComponents()
  registerGrabberComponent()
  registerZoomerComponent()

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