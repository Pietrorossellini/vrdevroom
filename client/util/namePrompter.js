import {truncateText} from './text'

function promptForName() {
  let name
  name = prompt('Choose a nickname')
  if (!name || name === '') name = 'Unknown'
  return truncateText(name, 8, false)
}

export {
  promptForName
}
