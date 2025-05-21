import * as core from './core.js'

export interface Node {
  id: string
  content: Content
  nodes?: Node[]
  edges?: Edge[]
}

export interface Edge {
  sourceId: string
  targetId: string
  content?: Content
}

export interface Content {
  type: string
  payload?: any
}

export function convertCoreToTransportNode(coreNode: core.Node): Node {
  return {
    id: coreNode.id,
    content: coreNode.content,
    nodes: coreNode.nodes.map(node => convertCoreToTransportNode(node)),
    edges: coreNode.edges.map(coreEdge => convertCoreToTransportEdge(coreEdge))
  }
}

function convertCoreToTransportEdge(coreEdge: core.Edge): Edge {
  return {
    sourceId: coreEdge.source.id,
    targetId: coreEdge.target.id,
    content: coreEdge.content
  }
}
