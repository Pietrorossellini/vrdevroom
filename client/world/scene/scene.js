import * as log from 'loglevel'

import Room from './entities/Room'
import Board from './entities/board/Board'
import Avatar from './entities/avatar/Avatar'
import Camera from './entities/Camera'
import Message from './entities/Message'
import * as Light from './entities/Light'
import * as Pointer from './entities/Pointer'

import {World} from '../../globals'
import {self} from '../../sync/ElementStore'

let scene = null
let camera = null

function createCamera(position) {
  log.info('Creating camera with position', position)

  camera = Camera(position)
  addToScene(camera)
  createPointer()
}

function createPointer() {
  let pointer

  if (AFRAME.utils.device.isGearVR()) {
    log.info('Using GearVR. Assuming GearVR controller is available: using laser controls.')
    pointer = Pointer.Laser()
    addToScene(pointer)
  } else {
    log.warn('Not using GearVR: reverting to cursor controls.')
    pointer = Pointer.Cursor()
    addToCamera(pointer)
  }

  self.add(World.Keys.Pointer, pointer)
}

function createAvatar(id, name, pos, orientation, slot) {
  log.info(`No existing avatar for id ${id} (name ${name}): creating`)

  const {x, z} = pos
  const y = World.USER_HEIGHT
  const avatar = Avatar(id, name, {x, y, z}, orientation, World.AVATAR_COLORS[slot])
  addToScene(avatar)
  return avatar
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

function addToScene(entity) { scene.appendChild(entity) }
function addToCamera(entity) { camera.appendChild(entity) }

function createScene() {
  log.info('Creating scene')

  scene = document.querySelector('a-scene')
  const boardPosition = {x: 0, y: 1.5, z: World.BOARD_POS.y}

  const entities = [
    Room(),
    Board(boardPosition),
    Light.Ambient(),
    Light.Point()
  ]

  entities.forEach(e => addToScene(e))
}

function createMinimalScene(message) {
  log.info('Creating minimal scene')

  scene = document.querySelector('a-scene')
  const messagePosition = {x: 0, y: World.USER_HEIGHT, z: -1.5}

  const entities = [
    Room(),
    Message(messagePosition, message),
    Light.Ambient(),
    Light.Point()
  ]

  entities.forEach(e => addToScene(e))
}

export {
  createScene,
  createMinimalScene,
  createCamera,
  createAvatar,
  removeAvatar
}