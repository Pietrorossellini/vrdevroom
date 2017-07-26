import {Record, List} from 'immutable'

export default Record({
  backlog: List(),
  todo: List(),
  doing: List(),
  done: List()
})
