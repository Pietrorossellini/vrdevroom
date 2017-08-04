import * as log from 'loglevel'

import Streams from './StreamsStore'
import Panner from './Panner'

export default (() => {
  let audioCtx

  function init() {
    log.info('Initializing audio')
    audioCtx = new AudioContext()
  }

  function createAudioNode(id) {
    log.info('Creating audio node for client', id)
    return new Panner(Streams.get(id))
  }

  function getContext() {
    return audioCtx
  }

  function getListener() {
    return audioCtx.listener
  }

  return {
    init,
    getContext,
    createAudioNode,
    getListener
  }
})()