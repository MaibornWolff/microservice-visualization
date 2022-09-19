import * as d3Base from 'd3'
import { graphviz } from 'd3-graphviz'

import { Node } from './domain/model'
import {
  SystemToDotConverter,
  Options as SystemToDotOptions
} from './domain/systemToDot'

// attach all d3 plugins to the d3 library
// see https://www.giacomodebidda.com/how-to-import-d3-plugins-with-webpack/
const d3 = Object.assign(d3Base, { graphviz })

export class SystemRenderer {
  public static removeHeightFromSvg() {
    d3.select('#graph')
      .select('svg')
      .select((d, i, nodes) => {
        const selectedNode = d3.select(nodes[i])
        const currentHeight = selectedNode.attr('height')
        console.log('currentHeight: ' + currentHeight)
        selectedNode.attr('height', null)
      })
  }

  private readonly defaultOptions: SystemToDotOptions = {
    urlExtractor: () => ''
  }

  renderSystem(
    system: Node,
    postRenderActions?: () => void,
    options?: SystemToDotOptions
  ) {
    const transition = d3.transition().delay(100).duration(1000)

    const systemToDotConverter = new SystemToDotConverter(
      options || this.defaultOptions
    )

    d3.select('#graph')
      .graphviz()
      .transition(transition)
      .width(window.innerWidth - 3 * 25)
      .height(window.innerHeight - 200)
      .fit(true)
      .renderDot(systemToDotConverter.convertSystemToDot(system), function () {
        this.resetZoom()

        if (postRenderActions) {
          postRenderActions()
        }
      })
  }
}
