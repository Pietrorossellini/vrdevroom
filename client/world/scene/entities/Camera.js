import {SyncSendComponent} from '../../../sync/components/senderComponents'
import {AudioComponent} from '../../../audio/audioComponents'

export default function(position) {
  const camera = document.createElement('a-camera')

  camera.setAttribute('position', position)
  camera.setAttribute(AudioComponent.Listener, '')
  camera.setAttribute(SyncSendComponent.Peer, '')

  return camera
}