import {Record, List} from 'immutable'

const Epic = Record({
  backlog: List(),
  todo: List(),
  doing: List(),
  done: List()
})

export {Epic}