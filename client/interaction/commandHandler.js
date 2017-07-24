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

  doCommand(command, action) {
    switch (action) {
      case Action.Activate:
        switch (command) {
          case Command.Zoom:
            if (this.zoomTimer || this.isGrabbing) break
            this.zoomTimer = setTimeout(() => this.pointer.addState('zooming'), 400)
            break
          case Command.Present:
            this._clearZoom()
            this.pointer.addState('presenting')
            this.pointer.setAttribute('line', {opacity: 1.0})
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
            this.pointer.removeState('presenting')
            this.pointer.setAttribute('line', {opacity: 0.3})
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
