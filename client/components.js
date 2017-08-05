import * as log from 'loglevel'

import {definitions as audio} from './audio/audioComponents'
import {definitions as tools} from './interaction/tools/toolComponents'
import {definitions as actions} from './interaction/actionComponents'
import {definitions as helpers} from './interaction/helperComponents'
import {definitions as animations} from './interaction/animationComponents'
import {definitions as lerp} from './sync/components/lerpComponents'
import {definitions as senders} from './sync/components/senderComponents'
import {definitions as receivers} from './sync/components/receiverComponents'

const definitions = [
  audio,
  tools,
  actions,
  helpers,
  animations,
  lerp,
  senders,
  receivers
]

const logDuplicateRegistering = () =>
  log.error('Component registration should only be called once.')

function registerComponent(name, definition) {
  AFRAME.registerComponent(name, definition)
}

const registerComponents = (() => {
  let isRegistered = false

  return function() {
    if (isRegistered) {
      logDuplicateRegistering()
      return
    }

    definitions.forEach(componentType =>
      Object.keys(componentType).forEach(c =>
        registerComponent(c, componentType[c])
      )
    )

    isRegistered = true
  }
})()

export {
  registerComponents
}