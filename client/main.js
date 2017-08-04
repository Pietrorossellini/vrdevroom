import * as AFRAME from 'aframe'

import {createScene} from './world/scene'
import {join} from './comms/commsHandler'
import {dispatch, subscribe} from './state'
import {World} from './util/globals'
import {getPositionForAvatar} from './util/position'
import {initAudio} from './audio/spatialAudio'
import {registerInputHandlers} from './interaction/inputHandler'
import {registerCardActions} from './interaction/actions'
import * as log from 'loglevel'

function start() {
  const isGearVr = AFRAME.utils.device.isGearVR()

  if (!isGearVr) log.warn('Unsupported device: not using GearVR. Some things may not work properly.')

  initAudio()
  registerInputHandlers(isGearVr)
  registerCardActions()

  subscribe(['room', 'slot'])
    .first()
    .onValue(index => {
      const [x, z] = getPositionForAvatar(World.BOARD_POS, index).toArray()
      const cameraPosition = new THREE.Vector3(x, 0, z)
      dispatch(new StateEvent({type: StateEventType.CameraPositioned, data: cameraPosition}))
    })

  subscribe(['self', 'position'])
    .first()
    .onValue(createScene)

  join()
}

export {
  start
}