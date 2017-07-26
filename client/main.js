import * as AFRAME from 'aframe'
import * as log from 'loglevel'

import {createScene, createCamera} from './world/scene'
import {join} from './comms/commsHandler'
import {subscribe} from './comms/roomState'
import avatar from './world/avatar'
import {initAudio} from './audio/spatialAudio'
import {prepareToLead} from './sync/receiver'

import {registerComponents} from './components'
import {registerInputHandlers} from './interaction/inputHandler'

function start() {
  const isGearVr = AFRAME.utils.device.isGearVR()

  if (!isGearVr) log.warn('Unsupported device: not using GearVR. Some things may not work properly.')

  registerComponents()
  initAudio()

  subscribe(['slot'])
    .first()
    .onValue(index => {
      avatar.configure(index)
      createScene()
      createCamera(avatar.getPosition())
      registerInputHandlers(isGearVr)
    })

  prepareToLead()
  join()
}

export {
  start
}