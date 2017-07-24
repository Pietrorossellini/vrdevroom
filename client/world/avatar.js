import {getPositionForAvatar} from '../util/position'
import {World} from '../util/globals'

const avatar = (() => {
  let slot = null
  let initialPosition = new THREE.Vector3()
  let color = 'red'

  const configure = slotInRoom => {
    slot = slotInRoom
    const [x, z] = getPositionForAvatar(World.BOARD_POS, slot).toArray()
    initialPosition.set(x, 0, z)
    color = World.AVATAR_COLORS[slot]
  }

  const getSlot = () => slot
  const getPosition = () => initialPosition
  const getColor = () => color

  return {
    configure,
    getSlot,
    getPosition,
    getColor
  }
})()

export default avatar