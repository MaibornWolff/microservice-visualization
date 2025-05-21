import { expect, describe, it } from 'vitest'

import { System, AsyncEventFlow, SyncDataFlow } from '../ms.js'
import { adaptToV1 } from './v1-adapter.js'
import { Metadata } from '../core.js'

describe('adaptToV1', () => {

  it('adapts a nested model to a nested v1 model', async() => {
    const system = new System('system')
    const serviceA = system.addMicroService('A')
    const exchangeB = system.addMessageExchange('B')
    system.edges.push(new AsyncEventFlow(serviceA, exchangeB))

    const subSystem = new System('sub-system')
    system.nodes.push(subSystem)
    const serviceC = subSystem.addMicroService('C')
    const serviceD = subSystem.addMicroService('D')
    subSystem.edges.push(new SyncDataFlow(serviceC, serviceD))

    system.edges.push(new SyncDataFlow(serviceA, serviceC))

    const adaptedSystem = adaptToV1(system)

    expect(adaptedSystem.getName()).to.deep.equal(system.getPayload().name)

    expect(adaptedSystem.getNodes()).to.have.lengthOf(3)

    const adaptedServiceA = adaptedSystem.getNodes().find(node => node.getName() === 'A')
    expect(adaptedServiceA).to.not.be.undefined
    expect(adaptedServiceA.type).to.deep.equal('MicroService')

    const adaptedExchangeB = adaptedSystem.getNodes().find(node => node.getName() === 'B')
    expect(adaptedExchangeB).to.not.be.undefined
    expect(adaptedExchangeB.type).to.deep.equal('MessageExchange')

    expect(adaptedSystem.getEdges()).to.have.lengthOf(2)
    const abEdge = adaptedSystem.getEdges().find(edge => edge.sourceId === serviceA.id && edge.targetId === exchangeB.id)
    expect(abEdge).to.not.be.undefined
    expect(abEdge.type).to.deep.equal('AsyncInfoFlow')

    expect(adaptedSystem.getEdges().find(edge => edge.sourceId === serviceA.id && edge.targetId === serviceC.id)).to.not.be.undefined

    const adaptedSubSystem = adaptedSystem.getNodes().find(node => node.getName() === 'sub-system')
    expect(adaptedSubSystem).to.not.be.undefined
    expect(adaptedSubSystem.getNodes()).to.have.lengthOf(2)
    expect(adaptedSubSystem.getNodes().find(node => node.getName() === 'C')).to.not.be.undefined
    expect(adaptedSubSystem.getNodes().find(node => node.getName() === 'D')).to.not.be.undefined

    expect(adaptedSubSystem.getEdges()).to.have.lengthOf(1)
    const cdEdge = adaptedSubSystem.getEdges().find(edge => edge.sourceId === serviceC.id && edge.targetId === serviceD.id)
    expect(cdEdge).to.not.be.undefined
    expect(cdEdge.type).to.deep.equal('SyncInfoFlow')
  })

  it('puts payload fields and metadata into v1-properties', async() => {
    const system = new System('system')
    const metadata: Metadata = {
      transformer: 'T',
      context: 'C'
    }
    const serviceA = system.addMicroService('A', { x: '1' }, metadata)
    const exchangeB = system.addMessageExchange('B', { y: '2' })
    const eventFlow = new AsyncEventFlow(serviceA, exchangeB)
    eventFlow.content.payload = {
      x: '1'
    }
    eventFlow.content.metadata = metadata
    system.edges.push(eventFlow)

    const adaptedSystem = adaptToV1(system)

    expect(adaptedSystem.getNodes()).to.have.lengthOf(2)
    expect(adaptedSystem.getNodes().find(node => node.getName() === 'A').getProp('x', null)).to.equal('1')
    expect(adaptedSystem.getNodes().find(node => node.getName() === 'B').getProp('y', null)).to.equal('2')

    expect(adaptedSystem.getNodes()
      .find(node => node.getName() === 'A')
      .getProp('metadata', null)
    ).to.equal(metadata)

    expect(adaptedSystem.getEdges()[0].getProperties().x).to.equal('1')
    expect(adaptedSystem.getEdges()[0].getProperties().metadata).to.equal(metadata)
  })
})
