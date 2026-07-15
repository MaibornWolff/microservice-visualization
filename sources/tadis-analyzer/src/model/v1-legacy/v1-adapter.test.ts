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

    expect(adaptedSystem.getName()).toEqual(system.getPayload().name)

    expect(adaptedSystem.getNodes()).toHaveLength(3)

    const adaptedServiceA = adaptedSystem.getNodes().find(node => node.getName() === 'A')
    expect(adaptedServiceA).toBeDefined()
    expect(adaptedServiceA.type).toEqual('MicroService')

    const adaptedExchangeB = adaptedSystem.getNodes().find(node => node.getName() === 'B')
    expect(adaptedExchangeB).toBeDefined()
    expect(adaptedExchangeB.type).toEqual('MessageExchange')

    expect(adaptedSystem.getEdges()).toHaveLength(2)
    const abEdge = adaptedSystem.getEdges().find(edge => edge.sourceId === serviceA.id && edge.targetId === exchangeB.id)
    expect(abEdge).toBeDefined()
    expect(abEdge.type).toEqual('AsyncInfoFlow')

    expect(adaptedSystem.getEdges().find(edge => edge.sourceId === serviceA.id && edge.targetId === serviceC.id)).toBeDefined()

    const adaptedSubSystem = adaptedSystem.getNodes().find(node => node.getName() === 'sub-system')
    expect(adaptedSubSystem).toBeDefined()
    expect(adaptedSubSystem.getNodes()).toHaveLength(2)
    expect(adaptedSubSystem.getNodes().find(node => node.getName() === 'C')).toBeDefined()
    expect(adaptedSubSystem.getNodes().find(node => node.getName() === 'D')).toBeDefined()

    expect(adaptedSubSystem.getEdges()).toHaveLength(1)
    const cdEdge = adaptedSubSystem.getEdges().find(edge => edge.sourceId === serviceC.id && edge.targetId === serviceD.id)
    expect(cdEdge).toBeDefined()
    expect(cdEdge.type).toEqual('SyncInfoFlow')
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

    expect(adaptedSystem.getNodes()).toHaveLength(2)
    expect(adaptedSystem.getNodes().find(node => node.getName() === 'A').getProp('x', null)).toBe('1')
    expect(adaptedSystem.getNodes().find(node => node.getName() === 'B').getProp('y', null)).toBe('2')

    expect(adaptedSystem.getNodes()
      .find(node => node.getName() === 'A')
      .getProp('metadata', null)
    ).toBe(metadata)

    expect(adaptedSystem.getEdges()[0].getProperties().x).toBe('1')
    expect(adaptedSystem.getEdges()[0].getProperties().metadata).toBe(metadata)
  })
})
