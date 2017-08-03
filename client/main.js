import * as AFRAME from 'aframe'
import * as log from 'loglevel'

import {createScene, createCamera} from './world/scene/scene'
import {prepareForErrors} from './world/errorHandler'
import {join} from './comms/commsHandler'
import {subscribe} from './comms/roomState'
import avatar from './world/avatar'
import {initAudio} from './audio/spatialAudio'
import {prepareToLead} from './sync/receiver'

import {registerComponents} from './components'
import {registerInputHandlers} from './interaction/inputHandler'
import {promptForName} from './util/namePrompter'

function start() {
  const isGearVr = AFRAME.utils.device.isGearVR()
  if (!isGearVr) log.warn('Unsupported device: not using GearVR. Some things may not work properly.')

  const name = promptForName()
  registerComponents()
  initAudio()

  subscribe(['slot'])
    .first()
    .onValue(index => {
      avatar.configure(name, index)
      createScene()
      createCamera(avatar.getPosition())
      registerInputHandlers(isGearVr)
    })

  prepareForErrors()
  prepareToLead()

  join(name)
}

export {
  start
}