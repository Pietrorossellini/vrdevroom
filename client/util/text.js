const TruncateLength = 10

function truncateText(text) {
  return text.length > TruncateLength
    ? `${text.substring(0, 10)}...`
    : text
}

export {
  truncateText
}
