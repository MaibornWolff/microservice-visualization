import * as _ from 'lodash'
import { Node } from './model'
import { GraphService } from './service'

export class NodeFocusser {

  private graphService: GraphService

  constructor(graphService: GraphService) {
    this.graphService = graphService
  }

  focusNodeById(focusedNodeId: string, neighbourHoodLevel = 1): Node {
    const focusedNode = this.graphService.findNode(focusedNodeId)
    return this.focusNode(focusedNode, neighbourHoodLevel)
  }

  focusNode(focusedNode: Node, neighbourHoodLevel: number): Node {
    const neighbourNodeIds = []
    neighbourNodeIds.push(focusedNode.id)

    let remainingNeighourHoods = neighbourHoodLevel
    while (remainingNeighourHoods > 0) {
      const newNeighbourNodeIds: string[] = _.flatten(neighbourNodeIds
        .map(nodeId => this.graphService.getNeighbourNodeIds(nodeId)))
      newNeighbourNodeIds
        .forEach(nodeId => {
          if (!neighbourNodeIds.find(neighbourNodeId => neighbourNodeId === nodeId)) {
            neighbourNodeIds.push(nodeId)
          }
        })
      remainingNeighourHoods--
    }

    const allInnerNodeIds = this.graphService.getAllNodesOfNode(focusedNode).map(node => node.id)

    const additionalIds: string[] = []
    if (this.graphService.isNotConnected(focusedNode)) {
      this.graphService.getAllEdges().forEach(edge => {
        if (allInnerNodeIds.includes(edge.sourceId)) {
          additionalIds.push(edge.targetId)
        }
        if (allInnerNodeIds.includes(edge.targetId)) {
          additionalIds.push(edge.sourceId)
        }
      })
    }

    const nodeIdsToKeep = _.union([ focusedNode.id ], neighbourNodeIds, allInnerNodeIds, additionalIds)

    return this.graphService.reduce(nodeIdsToKeep)
  }

}
