function Ambient() {
  const ambient = document.createElement('a-entity')
  ambient.setAttribute('light', {
    type: 'ambient',
    color: '#FAFAD2',
    intensity: 0.5
  })

  return ambient
}

function Point() {
  const point = document.createElement('a-entity')
  point.setAttribute('light', {
    type: 'point',
    color: '#FAFAD2',
    intensity: 0.9,
    distance: 5,
    decay: 1
  })
  point.setAttribute('position', {x: 0, y: 2.8, z: -1.6})

  return point
}

export {
  Ambient,
  Point
}
