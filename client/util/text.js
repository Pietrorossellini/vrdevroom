import {words, orderBy, head} from 'lodash'

function truncateText(text, length = 10) {
  return text.length > length ? text.substring(0, length) : text
}

function findLongestWord(text) {
  return head(orderBy(words(text), word => word.length, 'desc'))
}

export {
  truncateText,
  findLongestWord
}
