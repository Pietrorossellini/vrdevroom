if (process.env.NODE_ENV !== 'production') require('../public/index.html') // live reload index.html (not in prod)

import * as aframe from 'aframe'
import * as THREE from 'three'
import {getPositionForAvatar} from './util/position'

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

function createCamera() {
  const camera = document.createElement('a-camera')
  camera.setAttribute('position', {x: 0, y: 0, z: -0.5})

  scene.appendChild(camera)
}

function createPointer() {
  const pointer = document.createElement('a-entity')
  pointer.setAttribute('laser-controls', {hand: 'left'})

  scene.appendChild(pointer)
}

function createBoard() {
  const board = document.createElement('a-plane')
  board.setAttribute('width', 3)
  board.setAttribute('height', 1.8)
  board.setAttribute('position', {x: 0, y: 1.5, z: -2.49})
  board.setAttribute('color', '#ffffff')

  const card = document.createElement('a-entity')
  card.setAttribute('geometry', {
    primitive: 'plane',
    width: 0.1,
    height: 0.1
  })
  card.setAttribute('position', {x: 0, y: 0.5, z: 0.01})
  card.setAttribute('material', 'color', 'yellow')
  card.setAttribute('text', {
    value: 'Cum sociis natoque penatibus et magnis dis parturient montes',
    color: 'black',
    wrapCount: 15,
  })

  board.appendChild(card)
  scene.append(board)
}

function createLighting() {
  const ambient = document.createElement('a-entity')
  ambient.setAttribute('light', {
    type: 'ambient',
    color: '#FAFAD2',
    intensity: 0.1
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

function createAvatar(index) {
  const pos = getPositionForAvatar(new THREE.Vector2(-2.5, 0), index)

  const head = document.createElement('a-entity')
  head.setAttribute('geometry', {
    primitive: 'sphere',
    radius: 0.16
  })
  head.setAttribute('material', 'color', '#ffffff')
  head.setAttribute('position', {x: pos.y, y: 1.6, z: pos.x})

  const body = document.createElement('a-entity')
  body.setAttribute('geometry', {
    primitive: 'cone',
    radiusTop: 0,
    radiusBottom: 0.2,
    height: 0.5
  })
  body.setAttribute('material', 'color', '#ffffff')
  body.setAttribute('position', {x: pos.y, y: 1.35, z: pos.x})

  scene.appendChild(head)
  scene.appendChild(body)
}

window.onload = () => {
  scene = document.querySelector('a-scene')
  createCamera()

  createRoom()
  createPointer()
  createBoard()
  createLighting()

  createAvatar(0)
  createAvatar(1)
  createAvatar(2)
  createAvatar(3)
}