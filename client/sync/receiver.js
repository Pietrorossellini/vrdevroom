import {peers, cards} from './state'
import {subscribe} from '../comms/roomState'
import {createAvatar, removeAvatar, createRayCaster} from '../world/scene'
import {SyncReceiveComponent, SyncSendComponent} from './syncComponents'

import * as log from 'loglevel'

function handleRemoteChange(clientId, parsedData) {
  const [type, id, ...payload] = parsedData

  switch (type) {
    case 'peer':
      upsertPeer(clientId, payload)
      break
    case 'ray':
      upsertRay(clientId, payload)
      break
    case 'card':
      upsertCard(id, payload)
      break
    default:
      log.error('Received data with invalid type:', type)
  }
}

function handleRemoteExit(clientId) {
  removeAvatar(clientId)
  peers.remove(clientId)
}

function prepareToLead() {
  subscribe(['isLeader'])
    .filter(v => v === true)
    .onValue(() => {
      log.info('This client is the leader of the room')
      log.debug('Activating forced sync for cards', cards.getAll().toJS())

      cards.getAll().forEach(c => c.setAttribute(SyncSendComponent.Card, 'forcedSync', true))
    })
}

function upsertPeer(id, data) {
  const avatar = peers.get(id)
  const position = new THREE.Vector3().fromArray(data[0])
  const quaternion = new THREE.Quaternion().fromArray(data[1])

  if (avatar) avatar.emit('sync', {position, quaternion}, null, false)
  else {
    const a = createAvatar(id, position, quaternion)
    peers.add(id, a)
  }
}

function upsertRay(peerId, data) {
  const avatar = peers.get(peerId)
  const rayCaster = avatar.querySelector('.avatar__raycaster')

  const isPresenting = data[0]
  const position = new THREE.Vector3().fromArray(data[1])
  const direction = new THREE.Vector3().fromArray(data[2])

  // Remote client started presenting
  if (isPresenting && !rayCaster) {
    avatar.object3D.worldToLocal(position)
    createRayCaster(avatar, position, direction)
  }

  // Update representation
  else if (isPresenting) {
    avatar.object3D.worldToLocal(position)
    rayCaster.emit('sync', {position, direction}, null, false)
  }

  // Remote stopped presenting
  else if (rayCaster) {
    rayCaster.components[SyncReceiveComponent.Pointer].willDispose()
    avatar.removeChild(rayCaster)
  }
}

function upsertCard(id, data) {
  const [x, y] = data[0]
  const card = cards.get(id)

  if (card) card.emit('sync', {x, y})
  else log.warn(`No card by id ${id} found. Creation of new card by remote event is unsupported.`)
}

export {
  handleRemoteChange,
  handleRemoteExit,
  prepareToLead
}