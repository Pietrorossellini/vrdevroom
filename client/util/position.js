const getPositionForAvatar = (origin, index) => {
  const r = 2.9
  const offset = 0.125 * Math.PI * Math.floor(0.5 * (index + 1))
  const sign = index % 2 === 0 ? 1 : -1
  const x = origin.x + r * Math.cos(0.5 * Math.PI + sign * offset)
  const y = origin.y + r * Math.sin(0.5 * Math.PI + sign * offset)

  return new THREE.Vector2(x, y)
}

export {
  getPositionForAvatar
}