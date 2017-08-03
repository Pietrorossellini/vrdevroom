import {subscribe} from '../comms/roomState'
import {createMinimalScene} from './scene/scene'
import ui from './scene/ui'

function prepareForErrors() {
  subscribe(['full'])
    .first()
    .onValue(() => createMinimalScene('The room is full. \nPlease try to re-join later.'))

  subscribe(['error'])
    .filter(e => !!e)
    .onValue(e => ui.showMessage(e.message))

  subscribe(['error'])
    .filter(e => !e)
    .onValue(ui.clearMessage)
}

export {
  prepareForErrors
}
