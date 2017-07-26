import {Map} from 'immutable'
import {reduce} from 'lodash'

import Epic from './Epic'
import Card from './Card'

export default data => reduce(data, (b, work, epicName) =>
    b.set(epicName, reduce(work, (epic, tasks, workPhase) =>
        epic.set(workPhase, tasks.map(Card)),
      new Epic())),
  new Map())
