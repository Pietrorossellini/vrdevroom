import {Map} from 'immutable'
import {reduce} from 'lodash'

import boardData from '../data/board.json'
import {Epic} from '../models/Epic'
import {createCard} from '../models/Card'
import {self, cards} from '../sync/state'
import avatar from '../world/avatar'
import {SyncSendComponent} from '../sync/components/senderComponents'
import {SyncReceiveComponent} from '../sync/components/receiverComponents'
import {CardActionComponent} from '../interaction/actionComponents'
import {LerpComponent} from '../sync/components/lerpComponents'
import {World} from '../util/globals'

import {HelperComponent} from '../interaction/helperComponents'
import {truncateText} from '../util/text'

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
  board.setAttribute('position', {x: 0, y: 1.5, z: World.BOARD_POS.y - 0.001})
  board.setAttribute('color', '#ffffff')
  board.setAttribute('class', 'board interactive')

  const epics = generateBoardModel()

  let rowIndex = 0
  epics.forEach((taskList, name) => createEpic(name, taskList, rowIndex++))
  board.appendChild(createGrid(2))

  attachSyncHandlers()
  return board
}

function createGrid(numRows) {
  const grid = document.createElement('a-entity')
  grid.setAttribute('id', 'grid')
  grid.setAttribute('geometry', {
    primitive: 'plane',
    height: 0.01,
    width: BoardWidth
  })
  grid.setAttribute('material', 'color', 'lightgrey')
  const y = BoardHeight / 2 - BoardHeight / numRows
  grid.setAttribute('position', {x: 0, y, z: 0.001})

  // for (let i = 1; i < numRows - 1; i++) {
  //   const y = -i * (BoardHeight / numRows)
  //   const border = document.createElement('a-entity')
  //   border.setAttribute('geometry', {
  //     primitive: 'plane',
  //     height: 0.01,
  //     width: BoardWidth,
  //     buffer: false,
  //     skipCache: true,
  //     mergeTo: '#grid'
  //   })
  //
  //   border.setAttribute('position', {x: 0, y, z: 0})
  //   border.setAttribute('material', 'color', 'lightgrey')
  //   grid.appendChild(border)
  // }

  for (let i = 1; i < NumCols; i++) {
    const x = -BoardWidth / 2 + i * BoardWidth / NumCols
    const border = document.createElement('a-entity')
    border.setAttribute('geometry', {
      primitive: 'plane',
      height: BoardHeight,
      width: 0.01
    })
    border.setAttribute('position', {x, y: 0, z: 0})
    border.setAttribute('material', 'color', 'lightgrey')
    grid.appendChild(border)
  }

  return grid
}

function createEpic(name, taskList, rowIndex) {
  const rowPosition = new THREE.Vector3(
    0,
    0.5 * (BoardHeight - RowHeight) - rowIndex * (RowHeight + RowSep),
    0.001
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
  rowLabel.setAttribute('material', {
    color: 'grey'
  })
  rowLabel.setAttribute('text', {
    value: text,
    color: 'white',
    wrapCount: 8,
    align: 'center'
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
  colLabel.setAttribute('material', {
    color: 'grey'
  })
  colLabel.setAttribute('text', {
    value: text,
    color: 'white',
    wrapCount: 8,
    align: 'center'
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
    value: truncateText(task.text),
    color: 'black',
    wrapCount: 6,
    align: 'center'
  })
  card.setAttribute(CardActionComponent.Hover, '')
  card.setAttribute(CardActionComponent.Selection, 'color', avatar.getColor())
  card.setAttribute(HelperComponent.CardText, 'value', task.text)

  const cardPosition = new THREE.Vector3().addVectors(columnPosition,
    new THREE.Vector2(
      0.5 * ColWidth - World.CARD_SIZE.width - (i % 2 === 0 ? 0 : CardSepH),
      0.5 * RowHeight - World.CARD_SIZE.height - Math.floor(0.5 * i) * CardSepV,
    ))

  card.setAttribute('position', {
    x: cardPosition.x,
    y: cardPosition.y,
    z: World.CARD_Z
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