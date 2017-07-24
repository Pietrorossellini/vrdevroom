import * as AFRAME from 'aframe'

import {createScene, createCamera} from './world/scene'
import {join} from './comms/commsHandler'
import {subscribe} from './comms/roomState'
import avatar from './world/avatar'
import {initAudio} from './audio/spatialAudio'
import {registerInputHandlers} from './interaction/inputHandler'
import {registerCardActions} from './interaction/actions'
import {prepareToLead} from './sync/receiver'
import * as log from 'loglevel'

import {registerAudioComponents} from './audio/audioComponent'
import {registerSyncComponents} from './sync/syncComponents'
import {registerLerpComponents} from './sync/lerp'
import {registerGrabberComponent} from './interaction/tools/grabberComponent'
import {registerZoomerComponent} from './interaction/tools/zoomerComponent'

function start() {
  const isGearVr = AFRAME.utils.device.isGearVR()

  if (!isGearVr) log.warn('Unsupported device: not using GearVR. Some things may not work properly.')

  registerAudioComponents()
  registerCardActions()
  registerSyncComponents()
  registerLerpComponents()
  registerZoomerComponent()
  registerGrabberComponent()

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