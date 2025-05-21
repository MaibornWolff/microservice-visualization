import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, beforeAll, beforeEach, expect } from 'vitest'

import { ConfigService } from '../../config/Config.service.js'

import { System } from '../../model/ms.js'
import { FeignClientAnnotationAnalyzer } from './FeignClientAnnotationAnalyzer.js'
import { verifyEachContentHasTransformer } from '../../test/verifiers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe(FeignClientAnnotationAnalyzer.name, () => {
  let app: TestingModule

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, FeignClientAnnotationAnalyzer]
    }).compile()

    const config = app.get<ConfigService>(ConfigService)
    config.getSourceFolder = () => __dirname + '/testdata/source-folder'
  })

  it('transforms', async() => {
    const inputSystem = new System('test')

    const addFeignClientsStep = app.get<FeignClientAnnotationAnalyzer>(FeignClientAnnotationAnalyzer)
    const outputSystem = await addFeignClientsStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(3)
    const msNames = outputSystem.getMicroServices().map(ms => ms.getPayload().name)
    expect(msNames).toContainEqual('service-with-feign-clients')
    expect(msNames).toContainEqual('target-service1')
    expect(msNames).toContainEqual('target-service2')

    expect(outputSystem.getSyncDataFlows()).toHaveLength(2)
    expect(outputSystem.getSyncDataFlows()[0].source.id).toEqual(outputSystem.findMicroService('target-service1').id)
    expect(outputSystem.getSyncDataFlows()[0].target.id).toEqual(outputSystem.findMicroService('service-with-feign-clients').id)
    expect(outputSystem.getSyncDataFlows()[0].getPayload().definedEndpoints)
      .toEqual([
        { path: '/rest/path/1' },
        { path: '/rest/path/2' }
      ])
    expect(outputSystem.getSyncDataFlows()[1].getPayload().definedEndpoints)
      .toEqual([
        { path: '/target-service-2/{zc}/' }
      ])

    verifyEachContentHasTransformer(outputSystem, FeignClientAnnotationAnalyzer.name)
  })

  it('ignores source found in current project when not run in test mode', async() => {
    process.env.NODE_ENV = 'non-test'

    const inputSystem = new System('test')

    const addFeignClientsStep = app.get<FeignClientAnnotationAnalyzer>(FeignClientAnnotationAnalyzer)
    const outputSystem = await addFeignClientsStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(0)
  })
})
