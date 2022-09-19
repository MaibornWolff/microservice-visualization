export interface INode {
  id: string
  name?: string
  type?: string
  nodes?: INode[]
  edges?: IEdge[]
  properties?: Props
}

export interface IEdge {
  sourceId: string
  targetId: string
  type?: string
  properties?: Props
}

export interface Props {
  [key: string]: any
}

export class Node {
  public readonly id: string
  public readonly type: string

  private name: string
  private nodes: Node[]
  private edges: Edge[]
  private properties: Props

  constructor(id: string, name: string, type: string, nodes: Node[], edges: Edge[], properties?: Props) {
    this.id = id
    this.name = name
    this.type = type
    this.nodes = nodes ? nodes : []
    this.edges = edges ? edges : []
    this.properties = properties || {}
  }

  static ofRawNode(rawNode: INode): Node {
    const nodes = rawNode.nodes ? rawNode.nodes.map(node => Node.ofRawNode(node)) : []
    const edges = rawNode.edges ? rawNode.edges.map(edge => Edge.ofRawEdge(edge)) : []
    const properties = rawNode.properties ? JSON.parse(JSON.stringify(rawNode.properties)) : {}
    return new Node(rawNode.id, rawNode.name, rawNode.type, nodes, edges, properties)
  }

  getName(): string {
    return this.name
  }

  setName(name: string) {
    this.name = name
  }

  sameId(otherId: string): boolean {
    return this.id === otherId
  }

  getLabel(): string {
    return this.properties.label ? this.properties.label : this.id
  }

  getNodes(): Node[] {
    return this.nodes
  }

  hasNodes(): boolean {
    return this.nodes.length > 0
  }

  getEdges(): Edge[] {
    return this.edges
  }

  hasEdges(): boolean {
    return this.edges.length > 0
  }

  getProps(): Props {
    return this.properties
  }

  getProp(propName: string, alternativeValue: any): any {
    const value = this.properties ? this.properties[propName] : undefined
    return value !== undefined ? value : alternativeValue
  }

  addProp(propName: string, value: any): any {
    this.properties[propName] = value
  }
}

export class Edge {
  public readonly sourceId: string
  public readonly targetId: string
  public readonly type: string

  private source: Node = null
  private target: Node = null

  public properties: Props

  constructor(sourceId: string, targetId: string, type: string, properties?: Props) {
    this.sourceId = sourceId
    this.targetId = targetId
    this.type = type
    this.properties = properties || {}
  }

  static ofRawEdge(rawEdge: IEdge): Edge {
    const properties = rawEdge.properties ? JSON.parse(JSON.stringify(rawEdge.properties)) : {}
    return new Edge(rawEdge.sourceId, rawEdge.targetId, rawEdge.type, properties)
  }

  setSource(source: Node) {
    this.source = source
  }

  getSource() {
    return this.source
  }

  setTarget(target: Node) {
    this.target = target
  }

  getTarget() {
    return this.target
  }
}
