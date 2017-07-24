import {Map} from 'immutable'
import {reduce} from 'lodash'

import boardData from '../data/board.json'
import {Epic} from '../models/Epic'
import {createCard} from '../models/Card'
import {self, cards} from '../sync/state'
import avatar from '../world/avatar'
import {SyncSendComponent, SyncReceiveComponent} from '../sync/syncComponents'
import {CardAction} from '../interaction/actions'
import {LerpComponent} from '../sync/lerp'
import {World} from '../util/globals'

const BoardWidth = 3.0
const BoardHeight = 1.8
const NumCols = 4.0

const ColSep = 0.1
const RowSep = 0.4
const ColWidth = (BoardWidth - (NumCols - 1) * ColSep) / NumCols
const RowHeight = 0.5

const CardSepH = 0.25
const CardSepV = 0.25

let board

const generateBoardModel = () =>
  reduce(boardData, (b, work, epicName) =>
      b.set(epicName, reduce(work, (epic, tasks, workPhase) =>
          epic.set(workPhase, tasks.map(createCard)),
        new Epic())),
    new Map())

function createBoard() {
  board = document.createElement('a-plane')

  board.setAttribute('width', BoardWidth)
  board.setAttribute('height', BoardHeight)
  board.setAttribute('position', {x: 0, y: 1.5, z: -2.49})
  board.setAttribute('color', '#ffffff')
  board.setAttribute('class', 'board interactive')

  const epics = generateBoardModel()

  let rowIndex = 0
  epics.forEach((taskList, name) => createEpic(name, taskList, rowIndex++))

  attachSyncHandlers()
  return board
}

function createEpic(name, taskList, rowIndex) {
  const rowPosition = new THREE.Vector3(
    0,
    0.5 * (BoardHeight - RowHeight) - rowIndex * (RowHeight + RowSep),
    0.01
  )

  board.appendChild(createRowLabel(name, rowPosition))

  taskList.forEach((tasks, phase) => createColumn(phase, tasks, rowIndex, rowPosition))
}

function createRowLabel(text, rowPosition) {
  const rowLabel = document.createElement('a-entity')

  rowLabel.setAttribute('geometry', {
    primitive: 'plane',
    width: 0.4,
    height: 0.4
  })
  rowLabel.setAttribute('text', {
    value: text,
    color: 'white',
    wrapCount: 10,
  })

  const position = new THREE.Vector3().addVectors(rowPosition,
    new THREE.Vector3(
      -0.5 * BoardWidth - 0.2,
      0,
      0.1
    ))

  rowLabel.setAttribute('position', position)

  return rowLabel
}

function createColumn(phase, tasks, rowIndex, rowPosition) {
  const calculateColumnPosition = i => new THREE.Vector3().addVectors(rowPosition,
    new THREE.Vector3(
      -0.5 * (BoardWidth - ColWidth) + i * (ColWidth + ColSep),
      0,
      0.01
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

  if (rowIndex === 0) board.appendChild(createColumnLabel(phase, columnPosition))

  tasks.forEach((task, i) => board.appendChild(createTask(task, i, columnPosition)))
}

function createColumnLabel(text, columnPosition) {
  const colLabel = document.createElement('a-entity')

  colLabel.setAttribute('geometry', {
    primitive: 'plane',
    width: 0.4,
    height: 0.4
  })
  colLabel.setAttribute('text', {
    value: text,
    color: 'white',
    wrapCount: 10,
  })

  const position = new THREE.Vector3().addVectors(columnPosition,
    new THREE.Vector3(
      0,
      0.5 * RowHeight + 0.2,
      0.1
    ))

  colLabel.setAttribute('position', position)

  return colLabel
}

function createTask(task, i, columnPosition) {
  const card = document.createElement('a-entity')
  card.setAttribute('id', task.id)
  card.setAttribute('geometry', {
    primitive: 'plane',
    width: World.CARD_SIZE.width,
    height: World.CARD_SIZE.height
  })
  card.setAttribute('material', 'color', 'yellow')
  card.setAttribute('class', 'card interactive')
  card.setAttribute('text', {
    value: task.text,
    color: 'black',
    wrapCount: 10,
  })
  card.setAttribute(CardAction.Hover, '')
  card.setAttribute(CardAction.Selection, 'color', avatar.getColor())

  const cardPosition = new THREE.Vector3().addVectors(columnPosition,
    new THREE.Vector2(
      0.5 * ColWidth - World.CARD_SIZE.width - (i % 2 === 0 ? 0 : CardSepH),
      0.5 * RowHeight - World.CARD_SIZE.height - Math.floor(0.5 * i) * CardSepV,
    ))

  card.setAttribute('position', {
    x: cardPosition.x,
    y: cardPosition.y,
    z: 0.01
  })

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

export {
  createBoard
}