import * as AFRAME from 'aframe'

import {World} from '../util/globals'
import {self} from '../sync/state'

const SpaceKeyCode = 32
const cKeyCode = 67

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
      const pointer = self.get(World.Keys.Pointer)

      el.addEventListener('trackpaddown', _ => pointer.addState('presenting'))
      el.addEventListener('trackpadup', _ => pointer.removeState('presenting'))

      el.addEventListener('triggerdown', _ => pointer.emit('grab', {action: true}))
      el.addEventListener('triggerup', _ => pointer.emit('grab', {action: false}))
    }
  })
}

function addKeyListeners() {
  const getPointer = () => self.get(World.Keys.Pointer)

  window.addEventListener('keydown', e => {
    const key = e.keyCode
    if (key === SpaceKeyCode) getPointer().addState('presenting')
    else if (key === cKeyCode) getPointer().emit('grab', {action: true})
  })

  window.addEventListener('keyup', e => {
    const key = e.keyCode
    if (key === SpaceKeyCode) getPointer().removeState('presenting')
    else if (key === cKeyCode) getPointer().emit('grab', {action: false})
  })
}

export {
  registerInputHandlers,
  InputHandlerComponent
}
