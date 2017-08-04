import 'webrtc-adapter/out/adapter'

import {
  handleNewRemoteStream,
  handleDataReceive,
  getPc,
  addPc,
  deletePc,
  attachDc,
  sendMessage
} from './commsHandler'

import * as log from 'loglevel'

/*
 Connection formation
 */

function makeConnection(clientId, localStream) {
  log.info('New client available: creating connection')

  createPeerConnection(clientId)
  addTracksToPc(clientId, localStream)
  createDataChannel(clientId)
  doCall(clientId)
}

function acceptConnectionOffer(clientId, offer, localStream) {
  log.info('Got connection offer: accepting')

  createPeerConnection(clientId)
  addTracksToPc(clientId, localStream)
  const pc = getPc(clientId).pc
  pc.ondatachannel = event => handleDataChannel(event.channel, clientId)
  pc.setRemoteDescription(new RTCSessionDescription(offer))
  doAnswer(clientId)
}

function acceptConnectionAnswer(clientId, answer) {
  log.info('Got answer for offer: accepting')

  getPc(clientId).pc.setRemoteDescription(new RTCSessionDescription(answer))
}

function addIceCandidate(clientId, message) {
  log.debug('Received ICE candidate')

  const candidate = new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate: message.candidate
  })

  getPc(clientId).pc.addIceCandidate(candidate)
}

function addTracksToPc(clientId, stream) {
  stream.getTracks().forEach(t => getPc(clientId).pc.addTrack(t, stream))
}

/*
 Connection handlers
 */

function createPeerConnection(clientId) {
  try {
    const pc = new RTCPeerConnection(null)
    pc.onicecandidate = event => handleIceCandidate(clientId, event)
    pc.ontrack = event => handleNewRemoteStream(clientId, event)
    addPc(clientId, pc)
    log.info('Created RTCPeerConnection')
  } catch (e) {
    log.error('Error creating RTCPeerConnection:', e.message)
  }
}

function handleIceCandidate(clientId, event) {
  if (!event.candidate) {
    log.debug('End of ICE candidates')
    return
  }

  sendMessage({
    type: 'candidate',
    label: event.candidate.sdpMLineIndex,
    id: event.candidate.sdpMid,
    candidate: event.candidate.candidate
  }, clientId)
}

function handleDataChannel(channel, toClient) {
  channel.onopen = () => {
    channel.send(`Hello ${toClient}`)
    log.info(`Data channel to ${toClient} opened`)
  }
  channel.onclose = () => log.info(`Data channel to ${toClient} closed`)
  channel.onmessage = event => handleDataReceive(toClient, event.data)

  attachDc(toClient, channel)
}

function createDataChannel(clientId) {
  log.info('Creating data channel')

  const pc = getPc(clientId).pc
  const dc = pc.createDataChannel(null)

  handleDataChannel(dc, clientId)
  pc.ondatachannel = event => handleDataChannel(event.channel, clientId)
}

function doCall(clientId) {
  log.info('Sending description offer to peer')

  const handleError = err => log.error('Error creating peer connection offer: ', err)

  getPc(clientId).pc.createOffer(
    sessionDescription => setAndSendLocalDescription(clientId, sessionDescription),
    handleError
  )
}

function doAnswer(clientId) {
  log.info('Sending description answer to peer')

  const handleError = err => log.error('Failed to create session description:', err.toString())

  getPc(clientId).pc.createAnswer().then(
    sessionDescription => setAndSendLocalDescription(clientId, sessionDescription),
    handleError
  )
}

function setAndSendLocalDescription(clientId, sessionDescription) {
  getPc(clientId).pc.setLocalDescription(sessionDescription)
  sendMessage(sessionDescription, clientId)
}

function closePc(clientId) {
  getPc(clientId).dc.close()
  getPc(clientId).pc.close()
  deletePc(clientId)

  log.info(`Connection to client ${clientId} terminated`)
}

export {
  makeConnection,
  acceptConnectionOffer,
  acceptConnectionAnswer,
  addIceCandidate,
  closePc
}
