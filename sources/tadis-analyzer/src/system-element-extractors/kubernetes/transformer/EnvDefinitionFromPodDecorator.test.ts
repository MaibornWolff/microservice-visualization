import { Test, TestingModule } from '@nestjs/testing'

import { KubernetesApiService } from '../api/api.service.js'
import { ConfigService } from '../../../config/Config.service.js'
import { EnvDefinitionFromPodDecorator } from './EnvDefinitionFromPodDecorator.js'

import testPods from './testdata/api/pods.json' with { type: "json" }
import { System } from '../../../model/ms.js'

import { describe, it, beforeAll, expect } from 'vitest'

describe(EnvDefinitionFromPodDecorator.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, KubernetesApiService, EnvDefinitionFromPodDecorator]
    }).compile()
  })

  it('transforms', async() => {
    const apiService = app.get<KubernetesApiService>(KubernetesApiService)
    apiService.getPods = async() => testPods.body

    const inputSystem = new System('test')
    inputSystem.addMicroService('test-microservice', { p: 1 })

    const envService = app.get<EnvDefinitionFromPodDecorator>(EnvDefinitionFromPodDecorator)
    const outputSystem = await envService.transform(inputSystem)

    expect(outputSystem).to.not.be.null
    expect(outputSystem.nodes).to.have.lengthOf(1)
    expect(outputSystem.nodes[0].content.payload.env).to.deep.include({
      name: 'CACHE_SIZE',
      value: '10000'
    })
  })
})
