import { Node, Edge } from './model'

export class NodeCollapser {

  collapseContainedNodes(graph: Node): Node {
    if (graph.hasEdges()) {
      const redirectedEdges = graph.getEdges()
        .map(edge => this.getEdgeEndingsRedirectedToTopLevelNodes(graph, edge))

      const collapsedNodes = graph.getNodes()
        .map(node => {
          const nodeCopy = JSON.parse(JSON.stringify(node))
          return new Node(nodeCopy.id, nodeCopy.name, nodeCopy.type, [], [], nodeCopy.properties)
        })

      const graphCopy = JSON.parse(JSON.stringify(graph))
      return new Node(graphCopy.id, graphCopy.name, graphCopy.type, collapsedNodes, redirectedEdges, graphCopy.properties)
    } else {
      return graph
    }
  }

  getTopLevelParentOfNodeInGraph(searchedNodeId: string, graph: Node): Node {
    return graph.getNodes().find(node => this.isTopLevelParent(node, searchedNodeId)) || null
  }

  private isTopLevelParent(currentNode: Node, searchedNodeId: string): boolean {
    if (currentNode.getNodes().some(childNode => childNode.id === searchedNodeId)) {
      return true
    } else {
      return currentNode.getNodes().some(childNode => this.isTopLevelParent(childNode, searchedNodeId))
    }
  }

  private getEdgeEndingsRedirectedToTopLevelNodes(graph: Node, edge: Edge): Edge {
    const sourceId = this.getSourceOfEdgeRedirectedToTopLevelNode(edge, graph)
    const targetId = this.getTargetOfEdgeRedirectedToTopLevelNode(edge, graph)
    return new Edge(sourceId, targetId, edge.type)
  }

  private getSourceOfEdgeRedirectedToTopLevelNode(edge: Edge, graph: Node) {
    if (this.edgeIsNotBeginningInAnyDirectChild(edge, graph)) {
      return this.getTopLevelParentOfNodeInGraph(edge.sourceId, graph).id
    } else {
      return edge.sourceId
    }
  }

  private edgeIsNotBeginningInAnyDirectChild(edge: Edge, node: Node) {
    return !node.getNodes().find(node => node.id === edge.sourceId)
  }

  private getTargetOfEdgeRedirectedToTopLevelNode(edge: Edge, graph: Node) {
    if (this.edgeIsNotEndingInAnyDirectChild(edge, graph)) {
      return this.getTopLevelParentOfNodeInGraph(edge.targetId, graph).id
    } else {
      return edge.targetId
    }
  }

  private edgeIsNotEndingInAnyDirectChild(edge: Edge, node: Node) {
    return !node.getNodes().find(node => node.id === edge.targetId)
  }

}
