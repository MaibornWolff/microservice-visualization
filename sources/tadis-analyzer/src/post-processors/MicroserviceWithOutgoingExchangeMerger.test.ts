import { describe, it, expect } from 'vitest'
import { MicroserviceWithOutgoingExchangeMerger } from './MicroserviceWithOutgoingExchangeMerger.js'
import { System, AsyncEventFlow, MicroService } from '../model/ms.js'
import { Metadata } from 'src/model/core.js'

describe(MicroserviceWithOutgoingExchangeMerger.name, () => {
  it('can merge in standard case', async () => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('A')
    const serviceB = inputSystem.addMicroService('B')
    const exchangeB = inputSystem.addMessageExchange('B')
    const serviceC = inputSystem.addMicroService('C')
    inputSystem.edges.push(new AsyncEventFlow(serviceA, serviceB))
    inputSystem.edges.push(new AsyncEventFlow(serviceB, exchangeB))
    inputSystem.edges.push(new AsyncEventFlow(exchangeB, serviceC))

    const merger = new MicroserviceWithOutgoingExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(3)
    const mergedServiceB = system.nodes.find(
      (node) =>
        node.content.payload.name === 'B' &&
        node.content.type === MicroService.name
    )
    expect(mergedServiceB).not.toBeUndefined()
    expect(mergedServiceB.content.payload.reduced).toBe(true)

    expect(system.edges).toHaveLength(2)
    expect(
      system.edges.find(
        (edge) => edge.source.hasName('A') && edge.target.hasName('B')
      )
    ).not.toBeUndefined()
    expect(
      system.edges.find(
        (edge) => edge.source.hasName('B') && edge.target.hasName('C')
      )
    ).not.toBeUndefined()
  })

  it('can redirect other nodes connected to the exchange to the corresponding service', async () => {
    const inputSystem = new System('system')
    const serviceX = inputSystem.addMicroService('X')
    const serviceB = inputSystem.addMicroService('B')
    const exchangeB = inputSystem.addMessageExchange('B')
    inputSystem.edges.push(new AsyncEventFlow(serviceB, exchangeB))
    inputSystem.edges.push(new AsyncEventFlow(serviceX, exchangeB))

    const merger = new MicroserviceWithOutgoingExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    const mergedServiceB = system.nodes.find(
      (node) =>
        node.content.payload.name === 'B' &&
        node.content.type === MicroService.name
    )
    expect(mergedServiceB).not.toBeUndefined()
    expect(mergedServiceB.content.payload.reduced).toBe(true)

    expect(system.edges).toHaveLength(1)
    expect(
      system.edges.find(
        (edge) => edge.source.hasName('X') && edge.target.hasName('B')
      )
    ).not.toBeUndefined()
  })

  it('can merge and keeps unconnected nodes', async () => {
    const inputSystem = new System('system')
    inputSystem.addMicroService('A')
    const serviceB = inputSystem.addMicroService('B')
    const exchangeB = inputSystem.addMessageExchange('B')

    inputSystem.edges.push(new AsyncEventFlow(serviceB, exchangeB))

    const merger = new MicroserviceWithOutgoingExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
  })

  it('does not merge exchanges which are connected to differently named services', async () => {
    const inputSystem = new System('system')
    const serviceA = inputSystem.addMicroService('A')
    const exchangeB = inputSystem.addMessageExchange('B')

    inputSystem.edges.push(new AsyncEventFlow(serviceA, exchangeB))

    const merger = new MicroserviceWithOutgoingExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    expect(system.nodes).toContain(serviceA)
    expect(system.nodes).toContain(exchangeB)
  })

  it('does not merge exchanges which are connected to nodes of same name but of a type different from MicroService', async () => {
    const inputSystem = new System('system')
    const exchangeA = inputSystem.addMessageExchange('A')
    const queueA = inputSystem.addMessageQueue('A')

    inputSystem.edges.push(new AsyncEventFlow(exchangeA, queueA))

    const merger = new MicroserviceWithOutgoingExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    expect(system.nodes).toContain(exchangeA)
    expect(system.nodes).toContain(queueA)
  })

  it('merges payload and metadata of service and exchange and the edge between them', async () => {
    const inputSystem = new System('system')

    const metadataOfServiceB: Metadata = {
      transformer: 't1',
      context: 'c1'
    }
    const serviceB = inputSystem.addMicroService(
      'B',
      { p: 1 },
      metadataOfServiceB
    )

    const metadataOfExchangeB: Metadata = {
      transformer: 't2',
      context: 'c2'
    }
    const exchangeB = inputSystem.addMessageExchange(
      'B',
      { q: 2 },
      metadataOfExchangeB
    )

    const metadataOfEdgeAtoB: Metadata = {
      transformer: 't3',
      context: 'c3'
    }
    inputSystem.edges.push(
      new AsyncEventFlow(
        serviceB,
        exchangeB,
        { routingKey: 'r' },
        metadataOfEdgeAtoB
      )
    )

    const serviceC = inputSystem.addMicroService('C')

    const metadataOfEdgeBtoC: Metadata = {
      transformer: 't4',
      context: 'c4'
    }
    inputSystem.edges.push(
      new AsyncEventFlow(
        exchangeB,
        serviceC,
        { routingKey: 'r' },
        metadataOfEdgeBtoC
      )
    )

    const merger = new MicroserviceWithOutgoingExchangeMerger()
    const system = await merger.transform(inputSystem)

    expect(system.nodes).toHaveLength(2)
    expect(system.nodes[0].content.payload.p).toBe(1)
    expect(system.nodes[0].content.payload.q).toBe(2)
    expect(system.nodes[0].content?.metadata?.transformer).toBe('t1; t2; t3')
    expect(system.nodes[0].content?.metadata?.context).toBe('c1; c2; c3')

    expect(system.edges).toHaveLength(1)
    expect(system.edges[0].content?.payload).toEqual({ routingKey: 'r' })
    expect(system.edges[0].content?.metadata).toEqual(metadataOfEdgeBtoC)
  })
})
