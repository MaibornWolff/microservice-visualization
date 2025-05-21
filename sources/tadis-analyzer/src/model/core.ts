import pkg from 'lodash';
const { union, flatten } = pkg;

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

  ensureContainsNodeOfTypeAndName(typeName: string, nodeName: string, extraPayload: any = {}, metadata?: Metadata): Node {

    const existingNode = this.findNodeOfTypeWithName(typeName, nodeName)
    if (existingNode) {
      if (extraPayload) {
        Object.getOwnPropertyNames(extraPayload)
          .forEach(payloadPropertyName => existingNode.content.payload[payloadPropertyName] = extraPayload[payloadPropertyName])
      }
      return existingNode
    }

    const id = this.id + '__' + typeName + '_' + nodeName
    const content = {
      type: typeName,
      metadata,
      payload: {
        name: nodeName,
        ...extraPayload
      }
    }

    const node = new Node(id, content)
    this.nodes.push(node)
    return node
  }

  findNodeOfTypeWithName(typeName: string, nodeName: string): Node {
    const node = this.nodes
      .find(node => node.content.type === typeName && node.content.payload && node.content.payload.name === nodeName)
    if (node) {
      return node
    }
    return undefined
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
    return union(this.edges, flatten(this.nodes.map(node => node.edges)))
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
    public metadata?: Metadata,
    public payload?: any
  ) { }
}

export type Metadata = {
  transformer: string,
  context: string,
  info?: string
}
