import 'aframe-look-at-component'

import Name from './Name'

import {AudioComponent} from '../../../../audio/audioComponents'
import {LerpComponent} from '../../../../sync/components/lerpComponents'
import {SyncReceiveComponent} from '../../../../sync/components/receiverComponents'

import RayCaster from '../RayCaster'

export default function(id, name, position, orientation, color) {
  const {x, y, z} = position

  const avatar = document.createElement('a-entity')
  avatar.setAttribute('id', id)

  avatar.appendChild(createHead({x: 0, y, z: 0}, orientation, color))
  avatar.appendChild(createBody({x: 0, y: y - 0.45, z: 0}, color))
  avatar.appendChild(createLabel(name))

  avatar.appendChild(RayCaster(id, color))

  avatar.setAttribute('position', {x, y: 0, z})
  attachComponents(avatar)

  return avatar
}

function createHead(position, orientation, color) {
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
    color,
    flatShading: true
  })
  head.setAttribute('position', position)

  const cap = document.createElement('a-entity')
  cap.setAttribute('geometry', {
    primitive: 'circle',
    radius: 0.1,
    segments: 8
  })
  cap.setAttribute('material', {color})
  head.appendChild(cap)

  const rod = document.createElement('a-entity')
  rod.setAttribute('geometry', {
    primitive: 'cylinder',
    radius: 0.025,
    segmentsRadial: 8,
    height: 0.2
  })
  rod.setAttribute('material', {
    color,
    flatShading: true
  })
  head.appendChild(rod)
  head.object3D.setRotationFromQuaternion(orientation)

  return head
}

function createBody(position, color) {
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
    color,
    flatShading: true
  })
  body.setAttribute('position', position)

  return body
}

function createLabel(name) {
  const nameLabel = Name(name)
  nameLabel.setAttribute('look-at', '[camera]')

  return nameLabel
}

function attachComponents(avatar) {
  avatar.setAttribute(AudioComponent.SpatialSource, '')
  avatar.setAttribute(LerpComponent.Avatar, '')
  avatar.setAttribute(SyncReceiveComponent.Peer, '')
}