export default function(cols, rows, width, height) {
  const rowHeight = height / rows

  const grid = document.createElement('a-entity')
  grid.setAttribute('id', 'grid')
  setGeometry(grid, {width})
  setMaterial(grid)
  const y = height / 2 - rowHeight
  grid.setAttribute('position', {x: 0, y, z: 0.001})

  for (let i = 1; i < rows - 1; i++) {
    const y = -i * height / rows
    const border = document.createElement('a-entity')
    setGeometry(border, {width})
    border.setAttribute('position', {x: 0, y, z: 0})
    setMaterial(border)
    grid.appendChild(border)
  }

  for (let i = 1; i < cols; i++) {
    const x = -width / 2 + i * width / cols
    const y = -(height / 2 - rowHeight)
    const border = document.createElement('a-entity')
    setGeometry(border, {height})
    border.setAttribute('position', {x, y, z: 0})
    setMaterial(border)
    grid.appendChild(border)
  }

  return grid
}

function setGeometry(entity, {width = 0.01, height = 0.01}) {
  entity.setAttribute('geometry', {
    primitive: 'plane',
    width,
    height
  })

  return entity
}

function setMaterial(entity) {
  entity.setAttribute('material', 'color', 'lightgrey')
  return entity
}
