import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, beforeAll, expect } from 'vitest'

import { ConfigService } from '../../../config/Config.service.js'

import { System } from '../../../model/ms.js'
import { OutgoingExchangesFromSourceCreator } from './OutgoingExchangesFromSourceCreator.js'
import { verifyEachContentHasTransformer } from '../../../test/verifiers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe(OutgoingExchangesFromSourceCreator.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, OutgoingExchangesFromSourceCreator]
    }).compile()

    const config = app.get<ConfigService>(ConfigService)
    config.getSourceFolder = () => __dirname + '/testdata/source-folder'
  })

  it('transforms', async() => {
    const inputSystem = new System('test')

    const addExchangesFormSourceStep = app.get<OutgoingExchangesFromSourceCreator>(OutgoingExchangesFromSourceCreator)
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(1)
    expect(outputSystem.getMessageExchanges()).toHaveLength(2)
    const exchangeNames = outputSystem.getMessageExchanges().map(exchange => exchange.getPayload().name)
    expect(exchangeNames).toEqual(expect.arrayContaining(['exchangeInSource1', 'exchangeInSource2']))

    verifyEachContentHasTransformer(outputSystem, OutgoingExchangesFromSourceCreator.name)
  })

  it('ignores source found in current project when not run in test mode', async() => {
    process.env.NODE_ENV = 'non-test'

    const inputSystem = new System('test')

    const addExchangesFormSourceStep = app.get<OutgoingExchangesFromSourceCreator>(OutgoingExchangesFromSourceCreator)
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(0)
    expect(outputSystem.getMessageExchanges()).toHaveLength(0)
  })
})
