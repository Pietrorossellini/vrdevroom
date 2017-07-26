import * as AFRAME from 'aframe'

import {
  CommandHandler,
  Command,
  Action
} from './commandHandler'
import {World} from '../globals'
import {self} from '../sync/ElementStore'

const SpaceKeyCode = 32
const cKeyCode = 67
const vKeyCode = 86

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
      this.commandHandler = new CommandHandler(pointer)

      el.addEventListener('trackpaddown', _ =>
        this.commandHandler.doCommand(Command.Present, Action.Activate))
      el.addEventListener('trackpadup', _ =>
        this.commandHandler.doCommand(Command.Present, Action.Deactivate))

      el.addEventListener('trackpadtouchstart', _ =>
        this.commandHandler.doCommand(Command.Zoom, Action.Activate))
      el.addEventListener('trackpadtouchend', _ =>
        this.commandHandler.doCommand(Command.Zoom, Action.Deactivate))

      el.addEventListener('triggerdown', _ =>
        this.commandHandler.doCommand(Command.Grab, Action.Activate))
      el.addEventListener('triggerup', _ =>
        this.commandHandler.doCommand(Command.Grab, Action.Deactivate))
    }
  })
}

// TODO Improve interaction
// Keyboard/mouse input should be improved now that from A-Frame 0.6.1 onwards
// mouse cursor position can be used as the raycaster
function addKeyListeners() {
  const pointer = self.get(World.Keys.Pointer)
  const commandHandler = new CommandHandler(pointer)
  const a = Action.Activate
  const d = Action.Deactivate

  window.addEventListener('keydown', e => {
    const key = e.keyCode

    if (key === SpaceKeyCode) commandHandler.doCommand(Command.Present, a)
    else if (key === cKeyCode) commandHandler.doCommand(Command.Grab, a)
    else if (key === vKeyCode) commandHandler.doCommand(Command.Zoom, a)
  })

  window.addEventListener('keyup', e => {
    const key = e.keyCode

    if (key === SpaceKeyCode) commandHandler.doCommand(Command.Present, d)
    else if (key === cKeyCode) commandHandler.doCommand(Command.Grab, d)
    else if (key === vKeyCode) commandHandler.doCommand(Command.Zoom, d)
  })
}

export {
  registerInputHandlers,
  InputHandlerComponent
}
