import * as d3 from 'd3'

import { SystemRenderer } from '../SystemRenderer.js'
import { NodeFocusser } from '../domain/NodeFocusser.js'
import { NodeCollapser } from '../domain/NodeCollapser.js'
import { GraphService } from '../domain/service.js'
import { NodeActions } from '../ui/NodeActions.js'
import { getBaseUrlInCurrentEnvironment } from '../appBaseUrl.js'

export class MenuActions {
  private nodeFocusser: NodeFocusser
  private nodeCollapser: NodeCollapser

  constructor(private systemRenderer: SystemRenderer, private graphService: GraphService) {
    this.nodeFocusser = new NodeFocusser(graphService)
    this.nodeCollapser = new NodeCollapser()
  }

  install() {
    this.registerMenuHandlers()
  }

  registerMenuHandlers() {
    d3.select('#info-link').on('click', () => {
      const infoElement = d3.select('#info')
      const currentDisplay = infoElement.style('display')
      infoElement.style('display', currentDisplay === 'none' ? 'block' : 'none')
    })

    d3.select('#complete-link').on('click', () => {
      this.systemRenderer.renderSystem(this.graphService.getGraph())
      new NodeActions(this.systemRenderer, this.graphService).install()
    })

    d3.select('#reload-no-cache-link').on('click', () => {
      const url = getBaseUrlInCurrentEnvironment() + '/html/?no-cache=1'
      window.open(url, '_self')
    })

    d3.select('#debug-link').on('click', () => {
      const url = getBaseUrlInCurrentEnvironment() + '/html/?debug=1'
      window.open(url, '_self')
    })

    d3.select('#svg-link').on('click', () => {
      const queryPosition = window.location.href.lastIndexOf('?')
      const query = queryPosition > -1 ? window.location.href.substr(queryPosition) : ''
      const url = getBaseUrlInCurrentEnvironment() + '/svg' + query
      window.open(url, '_blank')
    })

    d3.select('#cabinets-link').on('click', () => {
      const collapsedGraph = this.nodeCollapser.collapseContainedNodes(this.graphService.getGraph())
      this.systemRenderer.renderSystem(collapsedGraph)
      new NodeActions(this.systemRenderer, this.graphService).install()
    })
  }
}
