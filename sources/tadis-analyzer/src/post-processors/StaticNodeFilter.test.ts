import { ConfigService } from '../config/Config.service.js'

import { StaticNodeFilter } from './StaticNodeFilter.js'
import { System, AsyncEventFlow } from '../model/ms.js'

import { describe, it, expect } from 'vitest'

describe(StaticNodeFilter.name, () => {

  it('removes nodes to be excluded', async() => {
    const inputSystem = new System('system')

    const serviceAAA = inputSystem.addMicroService('AAA')
    inputSystem.addMessageExchange('AAA')
    const exchangeC = inputSystem.addMessageExchange('C')
    inputSystem.edges.push(new AsyncEventFlow(serviceAAA, exchangeC))

    const serviceD = inputSystem.addMicroService('D')
    inputSystem.edges.push(new AsyncEventFlow(exchangeC, serviceD))

    const serviceE = inputSystem.addMicroService('E')
    inputSystem.edges.push(new AsyncEventFlow(serviceD, serviceE))

    ConfigService.prototype.getExcludedNodeNames = () => {
      return ['A.*', 'C']
    }

    const config = new ConfigService()
    const nodeRemover = new StaticNodeFilter(config)
    const system = await nodeRemover.transform(inputSystem)

    expect(system.findMicroService('A')).toBeUndefined()
    expect(system.findMessageExchange('C')).toBeUndefined()
    expect(system.findMicroService('D')).not.toBeUndefined()
    expect(system.findMicroService('E')).not.toBeUndefined()
    expect(system.nodes).toHaveLength(2)
    expect(system.edges).toHaveLength(1)
    expect(system.edges[0].source.id).toBe(serviceD.id)
    expect(system.edges[0].target.id).toBe(serviceE.id)
    expect(system.content.metadata.transformer).toBe(StaticNodeFilter.name)
    expect(system.content.metadata.info).toBe('AAA, C')
  })
})
