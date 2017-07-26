import {CardActionComponent} from '../../../../interaction/actionComponents'
import {HelperComponent} from '../../../../interaction/helperComponents'
import {truncateText} from '../../../../util/text'

import {World} from '../../../../globals'

const CardSepH = 0.25
const CardSepV = 0.25

export default function(task, position, selectionColor) {
  const card = document.createElement('a-entity')
  card.setAttribute('id', task.id)
  card.setAttribute('geometry', {
    primitive: 'plane',
    width: World.CARD_SIZE.width,
    height: World.CARD_SIZE.height
  })
  card.setAttribute('material', 'color', 'yellow')
  card.setAttribute('class', 'card interactive')
  card.setAttribute('text', {
    value: truncateText(task.text),
    color: 'black',
    wrapCount: 6,
    align: 'center'
  })
  card.setAttribute(CardActionComponent.Hover, '')
  card.setAttribute(CardActionComponent.Selection, 'color', selectionColor)
  card.setAttribute(HelperComponent.CardText, 'value', task.text)

  card.setAttribute('position', position)

  return card
}

function findPosition(i, columnPosition, columnWidth, RowHeight) {
  return new THREE.Vector3().addVectors(columnPosition,
    new THREE.Vector2(
      0.5 * columnWidth - World.CARD_SIZE.width - (i % 2 === 0 ? 0 : CardSepH),
      0.5 * RowHeight - World.CARD_SIZE.height - Math.floor(0.5 * i) * CardSepV,
    )).setZ(0.01)
}

export {
  findPosition
}