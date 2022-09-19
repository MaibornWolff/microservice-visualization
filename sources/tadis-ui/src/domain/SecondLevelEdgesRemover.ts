import { Node } from './model'

/**
 * removes all 2nd level edges
 */
export class SecondLevelEdgesRemover {

  transformer(graph: Node): Node {
    const newTopNodes = graph.getNodes().map(topNode => this.getNodeWithoutContainedEdges(topNode))
    return new Node(graph.id, graph.getName(), graph.type, newTopNodes, graph.getEdges())
  }

  private getNodeWithoutContainedEdges(node: Node) {
    return new Node(node.id, node.getName(), node.type, node.getNodes(), [], node.getProps())
  }

}
