import { ArrowDirection } from './ArrowDirection'

const VIEW_PORT_MARGIN: number = 300

export class ScrollHandler {

  private event: Event = null

  private constructor(event: Event) {
    this.event = event
  }

  static handler(event: Event) {
    let sh = new ScrollHandler(event)
    sh.moveViewPort()
  }

  moveViewPort() {
    let edgeElement = (this.event.target as HTMLElement).parentElement
    let dAttr = edgeElement.querySelector('path').getAttribute('d')
    let coords = this.parseCommands(dAttr)

    let viewPortRelative = edgeElement.getBoundingClientRect()

    if ((this.event.target as HTMLElement).tagName === 'ellipse') {
      this.scroll2target(coords, viewPortRelative)
    } else {
      this.scroll2origin(coords, viewPortRelative)
    }

  }

  private parseCommands(command) {
    let commands = command.split(/(?=[LMC])/)
    // remove commando chars
    let charlessCommands = commands.map(e => {
      return e.replace(/L|M|C|/gi, '')
    })

    // pair coords
    let coordPairs = []
    charlessCommands.forEach((commandGroups, groupIndex) => {
      coordPairs[groupIndex] = []
      commandGroups.split(' ').forEach((e, i) => {
        let coords = e.split(',').map(parseFloat)
        coordPairs[groupIndex].push(coords)
      })
      return coordPairs
    })

    let offsetCoords = coordPairs[0][0] // only one tupel available
    let pathCoords = coordPairs[1]

    return {
      offset: offsetCoords,
      path: pathCoords.map(e => {
        return [e[0] - offsetCoords[0], e[1] - offsetCoords[1]]
      })
    }
  }

  private detectArrowDirection(pathCoords) {
    let size = pathCoords.length
    // 0 is x, 1 is y
    let horizontalDiff = pathCoords[0][0] - pathCoords[size - 1][0]
    let verticalDiff = pathCoords[0][1] - pathCoords[size - 1][1]

    let verticalDirection = null
    if (verticalDiff > 0) {
      verticalDirection = ArrowDirection.Up
    } else if (verticalDiff < 0) {
      verticalDirection = ArrowDirection.Down
    }

    let horizontalDirection = null
    if (horizontalDiff > 0) {
      horizontalDirection = ArrowDirection.Left
    } else if (horizontalDiff < 0) {
      horizontalDirection = ArrowDirection.Right
    }

    return {
      x: horizontalDirection,
      y: verticalDirection
    }
  }

  private scroll2origin(coords, viewPortRelative) {

    let targetPosition: ScrollToOptions = {
      top: window.pageYOffset,
      left: window.pageXOffset,
      behavior: 'smooth'
    }

    let direction = this.detectArrowDirection(coords.path)

    // target is above of view port
    if (direction.y === ArrowDirection.Down && viewPortRelative.top < VIEW_PORT_MARGIN) {
      targetPosition.top += viewPortRelative.top - VIEW_PORT_MARGIN
    }

    // target is beyond of view port
    if (direction.y === ArrowDirection.Up && viewPortRelative.bottom > document.body.clientHeight - VIEW_PORT_MARGIN) {
      targetPosition.top += viewPortRelative.bottom - VIEW_PORT_MARGIN
    }

    // target is left of view port
    if (direction.x === ArrowDirection.Right && viewPortRelative.left < VIEW_PORT_MARGIN) {
      targetPosition.left += viewPortRelative.left - VIEW_PORT_MARGIN
    }

    // target is right of view port
    if (direction.x === ArrowDirection.Left && viewPortRelative.right > document.body.clientWidth - VIEW_PORT_MARGIN) {
      targetPosition.left += viewPortRelative.right - VIEW_PORT_MARGIN
    }
    window.scroll(targetPosition)
  }

  private scroll2target(coords, viewPortRelative) {

    let targetPosition: ScrollToOptions = {
      top: window.pageYOffset,
      left: window.pageXOffset,
      behavior: 'smooth'
    }

    let direction = this.detectArrowDirection(coords.path)

    // target is above of view port
    if (direction.y === ArrowDirection.Up && viewPortRelative.top < VIEW_PORT_MARGIN) {
      targetPosition.top += viewPortRelative.top - VIEW_PORT_MARGIN
    }

    // target is beyond of view port
    if (direction.y === ArrowDirection.Down && viewPortRelative.bottom > document.body.clientHeight - VIEW_PORT_MARGIN) {
      targetPosition.top += viewPortRelative.bottom - VIEW_PORT_MARGIN
    }

    // target is left of view port
    if (direction.x === ArrowDirection.Left && viewPortRelative.left < VIEW_PORT_MARGIN) {
      targetPosition.left += viewPortRelative.left - VIEW_PORT_MARGIN
    }

    // target is right of view port
    if (direction.x === ArrowDirection.Right && viewPortRelative.right > document.body.clientWidth - VIEW_PORT_MARGIN) {
      targetPosition.left += viewPortRelative.right - VIEW_PORT_MARGIN
    }
    window.scroll(targetPosition)
  }
}
