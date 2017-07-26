export default function(cols, width, height) {
  const rows = 2

  const grid = document.createElement('a-entity')
  grid.setAttribute('id', 'grid')
  grid.setAttribute('geometry', {
    primitive: 'plane',
    height: 0.01,
    width
  })
  grid.setAttribute('material', 'color', 'lightgrey')
  const y = height / 2 - height / rows
  grid.setAttribute('position', {x: 0, y, z: 0.001})

  for (let i = 1; i < cols; i++) {
    const x = -width / 2 + i * width / cols
    const border = document.createElement('a-entity')
    border.setAttribute('geometry', {
      primitive: 'plane',
      height,
      width: 0.01
    })
    border.setAttribute('position', {x, y: 0, z: 0})
    border.setAttribute('material', 'color', 'lightgrey')
    grid.appendChild(border)
  }

  return grid
}

