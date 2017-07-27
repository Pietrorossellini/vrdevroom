import {SyncReceiveComponent} from '../../../sync/components/receiverComponents'

export default function(peerId, color) {
  const rayCaster = document.createElement('a-entity')

  rayCaster.setAttribute('class', 'avatar__raycaster')
  rayCaster.setAttribute('id', `${peerId}__raycaster`)
  rayCaster.setAttribute('raycaster', {
    showLine: true,
    objects: '.interactive',
    recursive: false
  })

  rayCaster.setAttribute('line', {
    color: new THREE.Color().setStyle(color),
    opacity: 0.5
  })
  rayCaster.setAttribute('visible', false)

  rayCaster.setAttribute(SyncReceiveComponent.Pointer, {peerId})

  return rayCaster
}