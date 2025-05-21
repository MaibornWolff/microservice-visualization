import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { System } from '../model/ms.js'
import {
  PostProcessorsModule,
  SubSystemFromPayloadTransformer
} from './PostProcessors.module.js'

import { describe, it, beforeAll, expect } from 'vitest'

describe(PostProcessorsModule.name, () => {
  let app: INestApplication

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [PostProcessorsModule]
    }).compile()
    app = testingModule.createNestApplication()
    await app.init()
  })

  it('supports backward-compatible use of SubSystemFromPayloadTransformer', async () => {
    const inputSystem = new System('system')

    const transformer = app.get<SubSystemFromPayloadTransformer>(
      SubSystemFromPayloadTransformer
    )
    const system = await transformer.transform(
      inputSystem,
      SubSystemFromPayloadTransformer.getSubSystemNameFromCabinetLabel
    )

    expect(system.nodes).toHaveLength(0)
  })
})
