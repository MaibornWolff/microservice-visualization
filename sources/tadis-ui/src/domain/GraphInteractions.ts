import { Node } from './model'
import { NodeFocusser } from './NodeFocusser'
import { NodeCollapser } from './NodeCollapser'
import { GraphService } from './service'

export class GraphInteractions {
  static focusNode(graph: Node, focusNodeId: string): Node {
    return new NodeFocusser(new GraphService(graph)).focusNodeById(focusNodeId)
  }

  static collapseNode(graph: Node): Node {
    return new NodeCollapser().collapseContainedNodes(graph)
  }
}
