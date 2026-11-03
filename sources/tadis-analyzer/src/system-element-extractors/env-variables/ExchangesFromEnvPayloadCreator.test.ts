import { Test, TestingModule } from '@nestjs/testing'

import { verifyEachContentHasTransformer } from '../../test/verifiers.js'

import { ConfigService } from '../../config/Config.service.js'
import { ExchangesFromEnvPayloadCreator } from './ExchangesFromEnvPayloadCreator.js'

import { System } from '../../model/ms.js'

import { describe, it, beforeAll, expect } from 'vitest'

describe(ExchangesFromEnvPayloadCreator.name, () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, ExchangesFromEnvPayloadCreator]
    }).compile()
  })

  it('transforms', async () => {
    const inputSystem = new System('test')
    const service = inputSystem.addMicroService('test-microservice', { p: 1 }, {context: "test", transformer: ExchangesFromEnvPayloadCreator.name})
    service.getPayload().env = [
      {
        name: 'OUTGOING_EXCHANGE',
        value: 'test-outgoing-exchange'
      },
      {
        name: 'OUTGOING_ROUTING_KEY',
        value: 'test.outgoing.publish.update'
      },
      {
        name: 'EXCHANGE_INCOMING',
        value: 'test-incoming-exchange'
      },
      {
        name: 'ROUTING_KEY_INCOMING',
        value: 'test.incoming.publish.update'
      }
    ]

    const envExchangesService = app.get<ExchangesFromEnvPayloadCreator>(
      ExchangesFromEnvPayloadCreator
    )
    const outputSystem = await envExchangesService.transform(inputSystem)

    expect(outputSystem).not.toBeNull()
    expect(outputSystem.nodes).toHaveLength(3)
    expect(outputSystem.getMicroServices()).toHaveLength(1)
    expect(outputSystem.getMessageExchanges()).toHaveLength(2)
    expect(
      outputSystem.findMessageExchange('test-outgoing-exchange')
    ).toBeDefined()
    expect(
      outputSystem.findMessageExchange('test-incoming-exchange').content
        ?.metadata?.transformer
    ).toBe(ExchangesFromEnvPayloadCreator.name)

    verifyEachContentHasTransformer(
      outputSystem,
      ExchangesFromEnvPayloadCreator.name
    )

    expect(outputSystem.edges).toHaveLength(2)
    expect(
      outputSystem.edges.filter((edge) => edge.content?.type !== undefined)
    ).toHaveLength(2)

    expect(outputSystem.edges[0].source.id).toBe(
      outputSystem.findMicroService('test-microservice').id
    )
    expect(outputSystem.edges[0].target.id).toBe(
      outputSystem.findMessageExchange('test-outgoing-exchange').id
    )

    expect(outputSystem.edges[1].source.id).toBe(
      outputSystem.findMessageExchange('test-incoming-exchange').id
    )
    expect(outputSystem.edges[1].target.id).toBe(
      outputSystem.findMicroService('test-microservice').id
    )
  })
})
