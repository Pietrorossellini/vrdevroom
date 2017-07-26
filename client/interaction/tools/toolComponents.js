import grabber from './components/grabberComponent'
import zoomer from './components/zoomerComponent'

const ToolComponent = {
  Grabber: 'tool-grabber',
  Zoomer: 'tool-zoomer'
}

const definitions = {
  [ToolComponent.Grabber]: grabber,
  [ToolComponent.Zoomer]: zoomer
}

export {
  definitions,
  ToolComponent
}