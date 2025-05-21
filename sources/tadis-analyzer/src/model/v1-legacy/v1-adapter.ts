import { Logger } from '@nestjs/common'

import { System, SyncDataFlow, AsyncEventFlow } from '../ms.js'
import { Node } from '../core.js'
import * as v1 from './model.js'

const logger = new Logger('v1-adapter')

export function adaptToV1(system: System): v1.Node {
  const v1System = adaptNodeWithNestedNodes(system)
  addAdaptedEdgesNested(system, v1System)
  return v1System
}

function adaptNodeWithNestedNodes(node: Node): v1.Node {
  const v1Node = new v1.Node(node.id, node.content.payload.name, node.content.type, [], [], node.content.payload)
  v1Node.addProp('metadata', node.content.metadata)

  node.nodes.forEach(childNode => {
    const v1ChildNode = adaptNodeWithNestedNodes(childNode)
    v1Node.getNodes().push(v1ChildNode)
  })

  return v1Node
}

function addAdaptedEdgesNested(originNode: Node, v1Node: v1.Node) {
  originNode.edges.forEach(edge => {
    if (!edge.content) {
      logger.warn('edge is missing content: ' + `${edge.source.id} -> ${edge.target.id}`)
    }
    const v1Edge = new v1.Edge(edge.source.id, edge.target.id,
      adaptEdgeType(edge.content.type), edge.content.payload)
    v1Edge.getProperties().metadata = edge.content.metadata
    v1Node.getEdges().push(v1Edge)
  })

  originNode.nodes.forEach(childNode => {
    const matchingV1ChildNode = v1Node.getNodes().find(v1NodeChildNode => v1NodeChildNode.id === childNode.id)
    addAdaptedEdgesNested(childNode, matchingV1ChildNode)
  })
}

function adaptEdgeType(type: string): string {
  if (type === SyncDataFlow.name) return 'SyncInfoFlow'
  else if (type === AsyncEventFlow.name) return 'AsyncInfoFlow'
  else return type
}
