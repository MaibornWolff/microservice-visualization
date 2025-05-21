import { System, NamePayload, MessageExchange } from './ms.js'
import { TypedNode } from './core-typed.js'
import { Metadata, Content } from './core.js'
import { expect, describe, it } from 'vitest'

class TestNode extends TypedNode<NamePayload> {
  constructor(id: string, payload: NamePayload, metadata: Metadata) {
    super(id, payload, metadata, TestNode.name)
  }
}

describe('core-typed', () => {

  it('add named node only once and extend payload', () => {
    const system = new System('test')

    const node = system.addOrExtendNamedNode<TestNode>(TestNode, 'name')
    system.addOrExtendNamedNode<TestNode>(TestNode, 'name', { p1: '1' })
    system.addOrExtendNamedNode<TestNode>(TestNode, 'name', { p2: '2' })

    expect(system.nodes).to.have.lengthOf(1)
    expect(node.getPayload().name).to.deep.equal('name')
    expect(system.findTypedNodeWithName<TestNode>(TestNode, 'name')).to.not.be.undefined

    expect(node.content.payload.p1).to.deep.equal('1')
    expect(node.content.payload.p2).to.deep.equal('2')
  })

  it('adds nodes with an object of the given type', () => {
    const system = new System('test')

    const node = system.addOrExtendTypedNode(MessageExchange.name, 'name', undefined)

    expect(node.getName()).to.deep.equal('name')
    expect(node.content.payload.name).to.deep.equal('name')
  })
})
