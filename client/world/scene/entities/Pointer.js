import {InputHandlerComponent} from '../../../interaction/inputHandler'
import {SyncSendComponent} from '../../../sync/components/senderComponents'
import {ToolComponent} from '../../../interaction/tools/toolComponents'
import {AnimationComponent} from '../../../interaction/animationComponents'

import avatar from '../../avatar'

function createPointer() {
  const pointer = document.createElement('a-entity')
  pointer.setAttribute('id', 'pointer')

  return pointer
}

function configurePointer(pointer) {
  pointer.setAttribute('line', {
    opacity: 0.5,
    color: avatar.getColor()
  })

  pointer.setAttribute('raycaster', {
    objects: '.interactive',
    recursive: false
  })

  pointer.setAttribute(SyncSendComponent.Pointer, '')
  pointer.setAttribute(ToolComponent.Grabber, '')
  pointer.setAttribute(ToolComponent.Zoomer, '')
  pointer.setAttribute(AnimationComponent.PresentationIndicator, '')

  return pointer
}

function Laser() {
  const p = createPointer()
  p.setAttribute('laser-controls', '')
  p.setAttribute(InputHandlerComponent.GearVrController, '')

  return configurePointer(p)
}

function Cursor() {
  const p = createPointer()
  p.setAttribute('cursor', {rayOrigin: 'mouse'})

  return configurePointer(p)
}

export {
  Laser,
  Cursor
}
