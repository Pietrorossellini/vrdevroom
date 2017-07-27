import {words, orderBy, head} from 'lodash'

function truncateText(text, length = 10, appendEllipsis = true) {
  return text.length > length
    ? `${text.substring(0, length)}${appendEllipsis ? '...' : ''}`
    : text
}

function findLongestWord(text) {
  return head(orderBy(words(text), word => word.length, 'desc'))
}

export {
  truncateText,
  findLongestWord
}
