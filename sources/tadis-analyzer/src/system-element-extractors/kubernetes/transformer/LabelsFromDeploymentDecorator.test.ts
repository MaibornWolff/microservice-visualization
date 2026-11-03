import { Test, TestingModule } from '@nestjs/testing'

import { KubernetesApiService } from '../api/api.service.js'
import { ConfigService } from '../../../config/Config.service.js'

import testDeployments from './testdata/api/deployments.json' with { type: "json" }
import { System } from '../../../model/ms.js'
import { LabelsFromDeploymentDecorator } from './LabelsFromDeploymentDecorator.js'

import { describe, it, beforeAll, expect } from 'vitest'

describe(LabelsFromDeploymentDecorator.name, () => {
  let app: TestingModule

  beforeAll(async() => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, KubernetesApiService, LabelsFromDeploymentDecorator]
    }).compile()
  })

  it('transforms', async() => {
    const apiService = app.get<KubernetesApiService>(KubernetesApiService)
    apiService.getDeployments = async() => testDeployments.body

    const inputSystem = new System('test')
    inputSystem.addMicroService('test-microservice', { p: 1 })

    const addLabels = app.get<LabelsFromDeploymentDecorator>(LabelsFromDeploymentDecorator)
    const outputSystem = await addLabels.transform(inputSystem)

    expect(outputSystem).not.toBeNull()
    expect(outputSystem.nodes).toHaveLength(1)
    expect(outputSystem.nodes[0].content.payload.labels).toBeDefined()
    expect(outputSystem.nodes[0].content.payload.labels.cabinet).toBe('test-cabinet')
  })
})
