export default function() {
  const room = document.createElement('a-entity')

  room.setAttribute('geometry', {
    primitive: 'box',
    width: 7,
    height: 3.2,
    depth: 7
  })
  room.setAttribute('material', {
    color: '#fafafa',
    side: 'back',
    metalness: 0.1,
    roughness: 0.9
  })
  room.setAttribute('position', {x: 0, y: 1.6, z: 0})

  return room
}
