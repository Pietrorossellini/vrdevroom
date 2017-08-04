import {Map} from 'immutable'

const createStore = (() => {
  let store = Map()

  const get = k => store.get(k)
  const getAll = () => store
  const add = (k, v) => store = store.set(k, v)
  const remove = k => store = store.delete(k)

  return {
    get,
    getAll,
    add,
    remove
  }
})

export {
  createStore
}
