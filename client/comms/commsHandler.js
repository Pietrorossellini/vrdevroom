import 'webrtc-adapter/out/adapter'
import {Map, Record} from 'immutable'
import io from 'socket.io-client'
import * as log from 'loglevel'
import {
  makeConnection,
  acceptConnectionOffer,
  acceptConnectionAnswer,
  addIceCandidate,
  closePc
} from './peerConnection'
import {dispatch} from '../state'
import {handleRemoteChange, handleRemoteExit} from '../sync/receiver'
import {streams} from '../audio/spatialAudio'
import {Sync} from '../util/globals'

import config from '../config.json'

const socket = io.connect(config.sigServerAddress)
let pcs = Map()
let localStream = null
log.enableAll()

const Peer = Record({pc: null, dc: null})

/*
 Room events
 */

socket.on('created', room => {
  log.info(`Created room ${room}`)
  dispatch(new StateEvent({type: StateEventType.IsLeader, data: true}))
  dispatch(new StateEvent({type: StateEventType.Joined, data: 0}))
})

socket.on('join', room => {
  log.info(`A peer requested to join room ${room}`)
})

socket.on('joined', (room, _, slot) => {
  log.info(`Successfully joined room ${room}`)
  log.info(`Got slot ${slot}`)
  dispatch(new StateEvent({type: StateEventType.IsLeader, data: false}))
  dispatch(new StateEvent({type: StateEventType.Joined, data: slot}))
})

socket.on('leave', (room, peer) => {
  log.info(`Peer ${peer} leaved room ${room}`)
  closePc(peer)
  disposePeer(peer)
})

socket.on('full', room => log.warn(`Room ${room} is full!`))
socket.on('log', array => log.debug.apply(log, array))

/*
 Connection events
 */

socket.on('message', (clientId, message) => {
  // Messages are NOT echoed back to the original sender
  switch (message.type) {
    case 'streamAvailable':
      makeConnection(clientId, localStream)
      break
    case 'offer':
      acceptConnectionOffer(clientId, message, localStream)
      break
    case 'answer':
      acceptConnectionAnswer(clientId, message)
      break
    case 'candidate':
      addIceCandidate(clientId, message)
      break
  }
})

function sendMessage(message, clientId) {
  socket.emit('message', message, clientId)
}

function broadcastData(data) {
  pcs.forEach(peer => {
    const dc = peer.get('dc')
    if (!dc || dc.readyState !== 'open') return

    dc.send(JSON.stringify(data))
  })
}

function handleDataReceive(fromClient, data) {
  let parsed
  try {
    parsed = JSON.parse(data)
  } catch (e) {
    log.warn('Received malformed data. Expected JSON, got', typeof data, data)
    return
  }

  if (Sync.LOG_MESSAGES) log.debug(`Received data from client ${fromClient}:`, parsed)
  handleRemoteChange(fromClient, parsed)
}

function receivedLocalStream(stream) {
  log.info('Received local stream')

  localStream = stream
  sendMessage({type: 'streamAvailable'})
}

function handleNewRemoteStream(clientId, event) {
  log.info('Received remote stream')

  streams.add(clientId, event.streams[0])
}

function disposePeer(clientId) {
  streams.remove(clientId)
  handleRemoteExit(clientId)
}

function join() {
  const room = config.roomName || prompt('Please enter the room name:')

  if (room !== '') {
    log.debug(`Creating or joining room ${room}`)
    socket.emit('enter', room)

    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    })
      .then(receivedLocalStream)
      .catch(e => alert(`Error getting user media: ${e}`))
  }
}

function addPc(clientId, pc) {
  pcs = pcs.set(clientId, new Peer({pc}))
}

function attachDc(clientId, dc) {
  pcs = pcs.update(clientId, peer => peer.set('dc', dc))
}

function deletePc(clientId) {
  pcs = pcs.delete(clientId)
}

function getPc(clientId) {
  return pcs.get(clientId)
}

export {
  join,
  handleNewRemoteStream,
  sendMessage,
  broadcastData,
  handleDataReceive,
  getPc,
  addPc,
  deletePc,
  attachDc
}