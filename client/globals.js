const World = {}

World.BOARD_POS = new THREE.Vector2(0, -3.5)
World.CARD_SIZE = {width: 0.12, height: 0.12}
World.CARD_Z = 0.01
World.USER_HEIGHT = 1.6
World.AVATAR_COLORS = [
  '#5b7abf',
  '#16bc65',
  '#e3175f'
]

World.Keys = {
  Pointer: 'pointer'
}

const Sync = {}

Sync.TICK_RATE = 15
Sync.TICK_INTERVAL = 1000.0 / Sync.TICK_RATE
Sync.FORCE_UPDATE_INTERVAL = 1500
Sync.LOG_MESSAGES = false

export {
  World,
  Sync
}