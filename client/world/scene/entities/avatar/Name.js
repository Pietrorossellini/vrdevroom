export default function(name) {
  const nameLabel = document.createElement('a-text')
  nameLabel.setAttribute('value', name)
  nameLabel.setAttribute('position', {x: 0, y: 2, z: 0})
  nameLabel.setAttribute('align', 'center')
  nameLabel.setAttribute('width', 1.5)
  nameLabel.setAttribute('opacity', 0.5)

  return nameLabel
}