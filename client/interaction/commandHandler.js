import * as log from 'loglevel'

const Command = {
  Zoom: 'zoom',
  Present: 'present',
  Grab: 'grab'
}

const Action = {
  Activate: 'activate',
  Deactivate: 'deactivate'
}

class CommandHandler {
  constructor(pointer) {
    this.pointer = pointer
    this.zoomTimer = null
    this.isGrabbing = false
    this.isPresenting = false
  }

  _clearZoom() {
    clearTimeout(this.zoomTimer)
    this.zoomTimer = null
    this.pointer.removeState('zooming')
  }

  _clearGrab() {
    this.isGrabbing = false
    this.pointer.emit('grab', {action: false})
  }

  _clearPresent() {
    this.isPresenting = false
    this.pointer.removeState('presenting')
  }

  doCommand(command, action) {
    switch (action) {
      case Action.Activate:
        switch (command) {
          case Command.Zoom:
            if (this.zoomTimer || this.isGrabbing || this.isPresenting) break
            this.zoomTimer = setTimeout(() => this.pointer.addState('zooming'), 400)
            break
          case Command.Present:
            this._clearZoom()
            this.isPresenting = true
            this.pointer.addState('presenting')
            break
          case Command.Grab:
            this._clearZoom()
            this.isGrabbing = true
            this.pointer.emit('grab', {action: true})
            break
          default:
            log.warn(`Unsupported input command for action ${Action.Activate}`, command)
        }

        break
      case Action.Deactivate:
        switch (command) {
          case Command.Zoom:
            this._clearZoom()
            break
          case Command.Present:
            this._clearPresent()
            break
          case Command.Grab:
            this._clearGrab()
            break
          default:
            log.warn(`Unsupported input command for action ${Action.Deactivate}:`, command)
        }

        break
      default:
        log.warn('Unsupported input command action:', action)
    }
  }
}

export {
  CommandHandler,
  Command,
  Action
}
