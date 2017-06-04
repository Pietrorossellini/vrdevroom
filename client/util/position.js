import * as THREE from 'three'

const getPositionForAvatar = (origin, index) => {
  const r = 2.0
  const offset = 0.125 * Math.PI * (Math.floor(0.5 * index) + 1)
  const sign = index % 2 === 0 ? 1 : -1
  const x = origin.x + r * Math.cos(sign * offset)
  const y = origin.y + r * Math.sin(sign * offset)

  return new THREE.Vector2(x, y)
}

export {
  getPositionForAvatar
}