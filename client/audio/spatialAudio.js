import * as log from 'loglevel'
import {createStore} from '../util/structures'

let audioCtx
let streams

function initAudio() {
  log.info('Initializing audio')

  audioCtx = new AudioContext()
  streams = createStore()
}

function createAudioNode(id) {
  log.info('Creating audio node for client', id)

  const audio = new Audio()
  audio.srcObject = streams.get(id)

  const gainNode = audioCtx.createGain()
  gainNode.gain.value = 1.0

  const panner = createPanner()

  audio.onloadedmetadata = function() {
    const source = audioCtx.createMediaStreamSource(audio.srcObject)
    audio.muted = true
    audio.play()

    source.connect(gainNode)
    gainNode.connect(panner)
    panner.connect(audioCtx.destination)
  }

  return panner
}

function createPanner() {
  const panner = audioCtx.createPanner()
  panner.setPosition(0, 0, 0)

  return panner
}

function getListener() {
  return audioCtx.listener
}

export {
  initAudio,
  createAudioNode,
  getListener,
  streams
}