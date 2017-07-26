function truncateText(text, length = 10, appendEllipsis = true) {
  return text.length > length
    ? `${text.substring(0, length)}${appendEllipsis ? '...' : ''}`
    : text
}

export {
  truncateText
}
