import * as AFRAME from 'aframe'

import {createScene, createCamera} from './world/scene'
import {join} from './comms/commsHandler'
import {subscribe} from './comms/roomState'
import {World} from './util/globals'
import {getPositionForAvatar} from './util/position'
import {initAudio} from './audio/spatialAudio'
import {registerInputHandlers} from './interaction/inputHandler'
import {registerCardActions} from './interaction/actions'
import {prepareToLead} from './sync/receiver'
import * as log from 'loglevel'

function start() {
  const isGearVr = AFRAME.utils.device.isGearVR()

  if (!isGearVr) log.warn('Unsupported device: not using GearVR. Some things may not work properly.')

  createScene()
  initAudio()
  registerCardActions()

  subscribe(['slot'])
    .first()
    .onValue(index => {
      const [x, z] = getPositionForAvatar(World.BOARD_POS, index).toArray()
      const cameraPosition = new THREE.Vector3(x, 0, z)
      createCamera(cameraPosition)
      registerInputHandlers(isGearVr)
    })

  prepareToLead()
  join()
}

export {
  start
}