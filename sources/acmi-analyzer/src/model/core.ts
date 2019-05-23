import * as _ from 'lodash'

export class Node {
  public nodes: Node[]
  public edges: Edge[]

  constructor(
    public id: string,
    public content: Content,
    nodes?: Node[],
    edges?: Edge[]
  ) {
    this.nodes = nodes || []
    this.edges = edges || []
  }

  findContainedNodeByIdRecursive(nodeId: string): Node | undefined {
    if (this.id === nodeId) {
      return this
    }

    const directNode = this.findContainedNodeById(nodeId)
    if (directNode) {
      return directNode
    }

    for (const containedNode of this.nodes) {
      const indirectNode = containedNode.findContainedNodeByIdRecursive(nodeId)
      if (indirectNode) {
        return indirectNode
      }
    }

    return undefined
  }

  hasName(name: string): boolean {
    return this.content.payload.name === name
  }

  getName(): string | undefined {
    return this.content.payload.name
  }

  hasSameNameAs(otherNode: Node): boolean {
    return this.getName() !== undefined && this.hasName(otherNode.getName())
  }

  getAllEdges(): Edge[] {
    return _.union(this.edges, _.flatten(this.nodes.map(node => node.edges)))
  }

  hasNodes(): boolean {
    return this.nodes.length > 0
  }

  private findContainedNodeById(nodeId: string): Node | undefined {
    return this.nodes.find(node => node.id === nodeId)
  }

}

export class Edge {
  constructor(
    public source: Node,
    public target: Node,
    public content?: Content
  ) { }
}

export class Content {
  constructor(
    public type: string,
    // additional info that holds the creator of this content
    public transformerName?: string,
    public payload?: any
  ) { }
}
