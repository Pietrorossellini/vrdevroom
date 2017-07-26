const HelperComponent = {
  CardText: 'text-card'
}

const definitions = {}

definitions[HelperComponent.CardText] = {
  schema: {
    value: {type: 'string', default: ''}
  }
}

export {
  definitions,
  HelperComponent
}
