import {Record} from 'immutable'
import {uniqueId} from 'lodash'

const Card = Record({
  id: null,
  position: new THREE.Vector2(),
  text: ''
})

const CardFactory = (() => {
  const createCard = text => new Card({
    id: uniqueId('card__'),
    text
  })

  return {
    createCard
  }
})()

export default CardFactory.createCard
