import {getPositionForAvatar} from '../util/position'
import {World} from '../globals'

const avatar = (() => {
  let name = ''
  let slot = null
  let initialPosition = new THREE.Vector3()
  let color = 'red'

  const configure = (nickname, slotInRoom) => {
    name = nickname
    slot = slotInRoom
    const [x, z] = getPositionForAvatar(World.BOARD_POS, slot).toArray()
    initialPosition.set(x, 0, z)
    color = World.AVATAR_COLORS[slot]
  }

  const getName = () => name
  const getSlot = () => slot
  const getPosition = () => initialPosition
  const getColor = () => color

  return {
    configure,
    getName,
    getSlot,
    getPosition,
    getColor
  }
})()

export default avatar