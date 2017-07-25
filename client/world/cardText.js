import * as AFRAME from 'aframe'

const TextComponent = {
  Card: 'text-card'
}

const TruncateLength = 10

function registerCardTextComponent() {
  AFRAME.registerComponent(TextComponent.Card, {
    schema: {
      value: {type: 'string', default: ''}
    }
  })
}

function truncateText(text) {
  return text.length > TruncateLength
    ? `${text.substring(0, 10)}...`
    : text
}

export {
  registerCardTextComponent,
  truncateText,
  TextComponent
}
