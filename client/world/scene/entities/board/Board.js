import Card, {findPosition} from './Card'
import * as Label from './Label'
import Grid from './Grid'

import boardData from '../../../../data/board.json'
import Board from '../../../../models/Board'

import {cards} from '../../../../sync/ElementStore'
import avatar from '../../../avatar'

import {SyncSendComponent} from '../../../../sync/components/senderComponents'
import {SyncReceiveComponent} from '../../../../sync/components/receiverComponents'
import {LerpComponent} from '../../../../sync/components/lerpComponents'

const BoardWidth = 3.0
const BoardHeight = 1.8
const NumCols = 4.0

const ColSep = 0.1
const RowSep = 0.25
const ColWidth = (BoardWidth - (NumCols - 1) * ColSep) / NumCols
const RowHeight = 0.35

let board

function createBoard(position) {
  const {x, y} = position
  const z = position.z + 0.001

  board = document.createElement('a-plane')

  board.setAttribute('width', BoardWidth)
  board.setAttribute('height', BoardHeight)
  board.setAttribute('position', {x, y, z})
  board.setAttribute('color', '#ffffff')
  board.setAttribute('class', 'board interactive')

  const epics = Board(boardData)

  let rowIndex = 0
  epics.forEach((taskList, name) => createEpic(name, taskList, rowIndex++))
  const grid = Grid(NumCols, epics.size, BoardWidth, BoardHeight)
  board.appendChild(grid)

  attachSyncHandlers()
  return board
}

function createEpic(name, taskList, rowIndex) {
  const rowPosition = new THREE.Vector3(
    0,
    0.5 * (BoardHeight - RowHeight) - rowIndex * (RowHeight + RowSep),
    0.001
  )

  const position = Label.findRowLabelPosition(rowPosition, BoardWidth)
  const label = Label.Row(name, position)
  board.appendChild(label)

  taskList.forEach((tasks, phase) => createColumn(phase, tasks, rowIndex, rowPosition))
}


function createColumn(phase, tasks, rowIndex, rowPosition) {
  const calculateColumnPosition = i => new THREE.Vector3().addVectors(rowPosition,
    new THREE.Vector3(
      -0.5 * (BoardWidth - ColWidth) + i * (ColWidth + ColSep),
      0,
      0.001
    ))

  let columnPosition
  switch (phase) {
    case 'backlog':
      columnPosition = calculateColumnPosition(0)
      break
    case 'todo':
      columnPosition = calculateColumnPosition(1)
      break
    case 'doing':
      columnPosition = calculateColumnPosition(2)
      break
    case 'done':
      columnPosition = calculateColumnPosition(3)
      break
  }

  if (rowIndex === 0) {
    const position = Label.findColumnLabelPosition(columnPosition, RowHeight)
    const label = Label.Column(phase, position)
    board.appendChild(label)
  }

  tasks.forEach((task, i) => board.appendChild(createTask(task, i, columnPosition)))
}


function createTask(task, i, columnPosition) {
  const position = findPosition(i, columnPosition, ColWidth, RowHeight)
  const card = Card(task, position, avatar.getColor())
  cards.add(task.id, card)

  return card
}

function attachSyncHandlers() {
  cards.getAll().forEach(card => {
    card.setAttribute(SyncSendComponent.Card, '')
    card.setAttribute(SyncReceiveComponent.Card, '')
    card.setAttribute(LerpComponent.Card, '')
  })
}

export default createBoard
