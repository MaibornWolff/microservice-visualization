import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, beforeAll, expect } from 'vitest'

import { KubernetesApiService } from '../api/api.service.js'
import { ConfigService } from '../../../config/Config.service.js'
import { MicroservicesFromKubernetesCreator } from './MicroservicesFromKubernetesCreator.js'

import testServices from './testdata/api/services.json' with { type: "json" }
import testPods from './testdata/api/pods.json' with { type: "json" }
import { verifyEachContentHasTransformer } from '../../../test/verifiers.js'
import { System } from '../../../model/ms.js'

describe(MicroservicesFromKubernetesCreator.name, () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [
        ConfigService,
        KubernetesApiService,
        MicroservicesFromKubernetesCreator
      ]
    }).compile()
  })

  it('transforms', async() => {
    const configService = app.get<ConfigService>(ConfigService)
    configService.getKubernetesNamespace = () => 'test-ns'

    const apiService = app.get<KubernetesApiService>(KubernetesApiService)
    apiService.getPods = async() => testPods.body
    apiService.getServices = async() => testServices.body

    const kubernetesService = app.get<MicroservicesFromKubernetesCreator>(MicroservicesFromKubernetesCreator)

    const system = await kubernetesService.transform(new System(''))

    expect(system).not.toBeNull()
    expect(system.getPayload().name).toBe('test-ns')
    expect(system.nodes).toHaveLength(1)
    expect(system.nodes[0].content.payload.name).toBe('test-microservice')

    verifyEachContentHasTransformer(system, MicroservicesFromKubernetesCreator.name)
  })
})
