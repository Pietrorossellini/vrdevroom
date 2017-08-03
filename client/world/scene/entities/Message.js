export default function(position, message) {
  const msg = document.createElement('a-entity')

  msg.setAttribute('geometry', {
    primitive: 'plane',
    width: 1.0,
    height: 'auto'
  })
  msg.setAttribute('position', position)
  msg.setAttribute('material', {
    color: 'black',
    opacity: 0.6
  })
  msg.setAttribute('text', {
    value: message,
    color: 'white',
    wrapCount: 30,
    lineHeight: 50,
    align: 'center'
  })

  return msg
}
