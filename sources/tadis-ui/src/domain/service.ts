import { Node, Edge } from './model'
import * as _ from 'lodash'

export class GraphService {
  private graph: Node
  private allNodes: Node[]
  private allEdges: Edge[]

  /** the nodes and edges of the provided graph must not change while using the GraphService. */
  constructor(graph: Node) {
    this.graph = graph
  }

  static deepResolveNodesReferencedInEdges(node: Node) {
    const allNodes: Map<string, Node> = new Map()
    GraphService.computeAllNodes(node)
      .forEach(node => allNodes.set(node.id, node))

    GraphService.computeAllEdges(node).forEach(edge => {
      const source = allNodes.get(edge.sourceId)
      const target = allNodes.get(edge.targetId)
      if (!source || !target) {
        console.log('source or target missing')
      }
      edge.setSource(source)
      edge.setTarget(target)
    })
  }

  static computeAllEdges(root: Node): Edge[] {
    if (root.getEdges()) {
      return _.union(root.getEdges(), _.flatten(root.getNodes().map(node => this.computeAllEdges(node))))
    } else {
      return []
    }
  }

  static computeAllNodes(root: Node): Node[] {
    if (root.getNodes()) {
      return _.union(root.getNodes(), _.flatten(root.getNodes().map(node => this.computeAllNodes(node))))
    } else {
      return []
    }
  }

  getGraph(): Node {
    return this.graph
  }

  findNode(nodeId: string): Node {
    return this.getAllNodes().find(node => node.sameId(nodeId))
  }

  getNeighbourNodes(node: Node): Node[] {
    const sourceIds = this.getAllEdges()
      .filter((edge) => node.sameId(edge.targetId))
      .map((edge) => edge.sourceId)

    const targetIds = this.getAllEdges()
      .filter((edge) => node.sameId(edge.sourceId))
      .map((edge) => edge.targetId)

    const neighbourNodes = this.getAllNodes()
      .filter((node) => sourceIds.includes(node.id) || targetIds.includes(node.id))

    return neighbourNodes
  }

  getNeighbourNodeIds(nodeId: string): string[] {
    const sourceIds = this.getAllEdges()
      .filter((edge) => nodeId === edge.targetId)
      .map((edge) => edge.sourceId)

    const targetIds = this.getAllEdges()
      .filter((edge) => nodeId === edge.sourceId)
      .map((edge) => edge.targetId)

    return _.union(sourceIds, targetIds)
  }

  isConnected(node: Node): boolean {
    return this.getAllEdges().some(edge => edge.sourceId === node.id || edge.targetId === node.id)
  }

  isNotConnected(node: Node): boolean {
    return !this.isConnected(node)
  }

  reduce(idsToKeep: string[]) {
    return this.reduceNodesRecursive(this.graph, idsToKeep)
  }

  getNeighbourEdges(node: Node): Edge[] {
    return this.getAllEdges()
      .filter((edge) => edge.sourceId === node.id || edge.targetId === node.id)
  }

  getAllEdges(): Edge[] {
    if (!this.allEdges) {
      this.allEdges = GraphService.computeAllEdges(this.graph)
    }
    return this.allEdges
  }

  getAllEdgesConnectingNodeId(nodeIds: string[]): Edge[] {
    return this.getAllEdges().reduce((acc, edge) => {
      if (nodeIds.includes(edge.sourceId)) {
        acc.push(edge)
      } else if (nodeIds.includes(edge.targetId)) {
        acc.push(edge)
      }
      return acc
    }, [])
  }

  getAllNodes(): Node[] {
    if (!this.allNodes) {
      this.allNodes = GraphService.computeAllNodes(this.graph)
    }
    return this.allNodes
  }

  getAllNodesOfNode(node: Node): Node[] {
    return GraphService.computeAllNodes(node)
  }

  reduceNodesRecursive(node: Node, idsToKeep: string[]): Node {
    if (node.hasNodes()) {
      const reducedChildren = node.getNodes()
        .map(child => this.reduceNodesRecursive(child, idsToKeep))
        .filter(child => child !== null)

      if (reducedChildren.length > 0) {
        const reducedEdges = node.getEdges()
          .reduce((acc, edge) => {
            if (idsToKeep.includes(edge.sourceId) && idsToKeep.includes(edge.targetId)) {
              acc.push(edge)
            }
            return acc
          }, [])

        return new Node(node.id, node.getName(), node.type, reducedChildren, reducedEdges, node.getProps())
      }
    }

    if (idsToKeep.includes(node.id)) {
      return new Node(node.id, node.getName(), node.type, [], [], node.getProps())
    } else {
      return null
    }
  }

}
