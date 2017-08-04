import * as AFRAME from 'aframe'

import {World} from '../util/globals'
import {self} from '../sync/state'

const SpaceKeyCode = 32

const InputHandlerComponent = {
  GearVrController: 'gearvr-input-handler'
}

function registerInputHandlers(useGearVr) {
  useGearVr
    ? registerGearVrHandler()
    : addKeyListeners()
}

function registerGearVrHandler() {
  AFRAME.registerComponent(InputHandlerComponent.GearVrController, {
    init: function () {
      const el = this.el

      el.addEventListener('trackpaddown', _ => self.get(World.Keys.Pointer).addState('presenting'))
      el.addEventListener('trackpadup', _ => self.get(World.Keys.Pointer).removeState('presenting'))
    }
  })
}

function addKeyListeners() {
  window.addEventListener('keydown', e => {
    const key = e.keyCode
    if (key === SpaceKeyCode) self.get(World.Keys.Pointer).addState('presenting')
  })

  window.addEventListener('keyup', e => {
    const key = e.keyCode
    if (key === SpaceKeyCode) self.get(World.Keys.Pointer).removeState('presenting')
  })
}

export {
  registerInputHandlers,
  InputHandlerComponent
}
