import { Node } from './model.js'
import { NodeFocusser } from './NodeFocusser.js'
import { NodeCollapser } from './NodeCollapser.js'
import { GraphService } from './service.js'

export class GraphInteractions {
  static focusNode(graph: Node, focusNodeId: string): Node {
    return new NodeFocusser(new GraphService(graph)).focusNodeById(focusNodeId)
  }

  static collapseNode(graph: Node): Node {
    return new NodeCollapser().collapseContainedNodes(graph)
  }
}
