import * as d3 from 'd3'

import { Node } from '../domain/model.js'
import { SystemRenderer } from '../SystemRenderer.js'
import { NodeFocusser } from '../domain/NodeFocusser.js'
import { GraphService } from '../domain/service.js'

export class NodeActions {
  private nodeFocusser: NodeFocusser
  private focusedSystem: Node = null
  private focusedNodeId: string = null
  private focusLevel = 1
  private altKeyPressed = false
  private altKeyInfoText: string = null
  private selectedNode: any = null
  private initialNodeColorsById: Map<string, string[]> = new Map()

  constructor(private systemRenderer: SystemRenderer, private graphService: GraphService) {
    this.nodeFocusser = new NodeFocusser(graphService)
  }

  install() {
    this.registerElementHandlers()
    this.registerAltKey()
  }

  private registerElementHandlers() {
    d3.selectAll('.node,.cluster')
      .on('click', (d, i, nodes) => {
        const id = d3.select(nodes[i]).attr('id')

        if (this.altKeyPressed) {
          if (this.focusedNodeId === id) {
            this.focusLevel++
          } else {
            this.focusLevel = 1
          }
          this.focusedNodeId = id
          this.focusedSystem = this.nodeFocusser.focusNodeById(id, this.focusLevel)

          /* eslint-disable @typescript-eslint/no-this-alias */
          const actualThis = this
          this.systemRenderer.renderSystem(this.focusedSystem, function() {
            // INFO: extracting this code to a separate function was not working
            d3.selectAll('.node,.cluster')
              .select((d, i, nodes) => {
                const selectedNode = d3.select(nodes[i])
                const selectedId = selectedNode.attr('id')
                if (selectedId && selectedId === actualThis.focusedNodeId) {
                  actualThis.changeColors(selectedNode, ['#ff6300'])
                }
              })

            actualThis.install()
          })
        } else {
          const node = this.graphService.findNode(id)
          const url = node.getProp('url', null)
          if (url) {
            window.open(url, '_blank')
          }
        }
      })

    d3.selectAll('.node,.cluster').select((d, i, nodes) => {
      const node = d3.select(nodes[i])
      const nodeId = node.attr('id')
      this.initialNodeColorsById[nodeId] = this.getColors(node)
    })

    d3.selectAll('.node,.cluster')
      .on('mouseover', (d, i, nodes) => {
        this.selectedNode = d3.select(nodes[i])

        if (this.altKeyPressed) {
          this.showAltInfoForCurrentNode()
        } else {
          this.showInfoForCurrentNode()
        }
      })
      .on('mouseout', () => {
        this.showDefaultForCurrentNode()
        this.selectedNode = null
      })
  }

  private registerAltKey() {
    this.saveAltKeyInfo()

    window.onkeydown = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      if (this.altKeyPressed) {
        this.showAltKeyPressed()
        this.showAltInfoForCurrentNode()
      } else {
        this.showAltKeyInfo()
      }
    }

    window.onkeyup = (ev: KeyboardEvent) => {
      this.altKeyPressed = ev.altKey
      if (!this.altKeyPressed) {
        this.showAltKeyInfo()
      }
      if (this.selectedNode) {
        this.showInfoForCurrentNode()
      } else {
        this.showDefaultForCurrentNode()
      }
    }
  }

  private saveAltKeyInfo() {
    const altKeyInfo = d3.select('#alt-key-info')
    if (this.altKeyInfoText == null) {
      this.altKeyInfoText = altKeyInfo.text()
    }
  }

  private showAltKeyPressed() {
    const altKeyInfo = d3.select('#alt-key-info')
    altKeyInfo.classed('blue', false)
    altKeyInfo.classed('white bg-red', true)
    altKeyInfo.text('🎯 Node focus mode activated!')
  }

  private showAltKeyInfo() {
    const altKeyInfo = d3.select('#alt-key-info')
    altKeyInfo.classed('blue', true)
    altKeyInfo.classed('white bg-red', false)
    altKeyInfo.text(this.altKeyInfoText)
  }

  private showAltInfoForCurrentNode() {
    if (this.selectedNode) {
      this.changeColors(this.selectedNode, ['#ff4136'])
    }
  }

  private showInfoForCurrentNode() {
    if (this.selectedNode) {
      this.changeColors(this.selectedNode, ['#96ccff'])
    }
  }

  private showDefaultForCurrentNode() {
    if (this.selectedNode) {
      const nodeId = this.selectedNode.attr('id')
      this.changeColors(this.selectedNode, this.initialNodeColorsById[nodeId])
    }
  }

  private getColors(node: any): string[] {
    if (!node.select('polygon').empty()) {
      const colors: string[] = []
      node.selectAll('polygon')
        .filter((d, i, nodes) => {
          const selectedNode = d3.select(nodes[i])
          if (selectedNode.attr('fill') !== 'none') {
            colors.push(selectedNode.attr('fill'))
          }
        })
      return colors
    } else if (!node.select('path').empty()) {
      const color = node.select('path').attr('fill')
      return [color]
    }
    return []
  }

  private changeColors(node: any, newColors: string[]) {
    if (!node.select('polygon').empty()) {
      let currentColorIndex = 0
      let currentColor = newColors[0]
      node.selectAll('polygon')
        .select((d, i, nodes) => {
          const selectedNode = d3.select(nodes[i])
          const fill = selectedNode.attr('fill')
          if (fill && fill !== '' && fill !== 'none') {
            selectedNode.attr('fill', currentColor)
            currentColorIndex++
            currentColor = currentColorIndex < newColors.length ? newColors[currentColorIndex] : currentColor
          }
        })
    } else if (!node.select('path').empty()) {
      node.select('path').attr('fill', newColors[0])
    }
  }
}
