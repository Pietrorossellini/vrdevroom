import log from 'loglevel'

import Message from './entities/Message'
import {World} from '../../globals'

function getScene() {
  return document.querySelector('a-scene')
}

export default (() => {
  let messageEl = null

  function showMessage(msg, ) {
    if (messageEl) {
      log.warn('Multiple messages:', msg)
      return
    }

    const messagePosition = {x: 0, y: World.USER_HEIGHT, z: -1.5}
    const message = Message(messagePosition, msg)

    getScene().appendChild(message)
    messageEl = message
  }

  function clearMessage() {
    const parent = messageEl && messageEl.parentNode
    if (parent) parent.removeChild(messageEl)
    messageEl = null
  }

  return {
    showMessage,
    clearMessage
  }
})()
