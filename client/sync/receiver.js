import {peers, cards} from './ElementStore'
import {subscribe} from '../comms/roomState'
import {createAvatar, removeAvatar} from '../world/scene/scene'
import {SyncSendComponent} from './components/senderComponents'

import * as log from 'loglevel'

function handleRemoteChange(clientId, parsedData) {
  const [type, id, ...payload] = parsedData

  switch (type) {
    case 'peer':
      upsertPeer(clientId, id, payload)
      break
    case 'ray':
      updateRay(clientId, payload)
      break
    case 'card':
      upsertCard(clientId, id, payload)
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

function upsertPeer(id, name, data) {
  const avatar = peers.get(id)
  const position = new THREE.Vector3().fromArray(data[0])
  const quaternion = new THREE.Quaternion().fromArray(data[1])
  const slot = data[2]

  if (avatar) avatar.emit('sync', {position, quaternion}, null, false)
  else {
    const a = createAvatar(id, name, position, quaternion, slot)
    peers.add(id, a)
  }
}

function updateRay(peerId, data) {
  const avatar = peers.get(peerId)
  if (!avatar) return
  const rayCaster = avatar.querySelector('.avatar__raycaster')

  const isPresenting = data[0]
  const position = new THREE.Vector3().fromArray(data[1])
  const direction = new THREE.Vector3().fromArray(data[2])

  avatar.object3D.worldToLocal(position)
  rayCaster.emit('sync', {position, direction, isPresenting, peerId}, null, false)
}

function upsertCard(peerId, id, data) {
  const [x, y] = data[0]
  const isSelected = data[1]
  const card = cards.get(id)

  if (card) card.emit('sync', {x, y, isSelected, peerId}, null, false)
  else log.warn(`No card by id ${id} found. Creation of new card by remote event is unsupported.`)
}

export {
  handleRemoteChange,
  handleRemoteExit,
  prepareToLead
}