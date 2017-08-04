import Bacon from 'baconjs'
import {Record, Map} from 'immutable'

import * as log from 'loglevel'

window.StateEventType = {
  Joined: 'joined',
  IsLeader: 'isLeader',
  CameraPositioned: 'cameraPosition'
}

window.StateEvent = Record({type: null, data: null})

const initialState = Map({
  room: Map({
    slot: null,
    isLeader: null
  }),
  self: Map({
    position: null
  })
})

const state = (() => {
  const OpType = {
    Set: 'set',
    Merge: 'merge',
    Delete: 'delete'
  }

  const updates = Bacon.Bus()

  const state = updates
    .scan(initialState, (oldState, update) => {
      switch (update.op) {
        case OpType.Set:
          return oldState.setIn(update.keyPath, update.value)
        case OpType.Merge:
          return oldState.mergeIn(update.keyPath, update.value)
        case OpType.Delete:
          return oldState.deleteIn(update.keyPath)
        default:
          log.error('Invalid state change operation:', update.op)
          return oldState
      }
    })

  const setState = (keyPath, value) => updates.push({keyPath, op: OpType.Set, value})
  const mergeState = (keyPath, value) => updates.push({keyPath, op: OpType.Merge, value})
  const deleteState = keyPath => updates.push({keyPath, op: OpType.Delete})
  const getState = () => state

  return {
    setState,
    mergeState,
    getState,
    deleteState
  }
})()

const dispatch = event => {
  switch (event.type) {
    case StateEventType.Joined:
      state.setState(['room', 'slot'], event.data)
      break
    case StateEventType.IsLeader:
      state.setState(['room', 'isLeader'], event.data)
      break
    case StateEventType.CameraPositioned:
      state.setState(['self', 'position'], event.data)
      break
    default:
      throw new Error(`Unhandled event of type ${event.type} was dispatched.`)
  }
}

const subscribe = (keyPath, isEqual) => state.getState()
  .map(s => s.getIn(keyPath))
  .skipDuplicates(isEqual ? isEqual : (a, b) => a === b)
  .changes()

export {
  dispatch,
  subscribe
}