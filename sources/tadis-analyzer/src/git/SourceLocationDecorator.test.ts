import { Test, TestingModule } from '@nestjs/testing'

import { describe, it, beforeAll, expect } from 'vitest'

import { SourceLocationDecorator } from './SourceLocationDecorator.js'
import { GitStorageService } from './GitStorage.service.js'
import { StorageStatus } from './GitStorage.js'
import { System } from '../model/ms.js'
import { ConfigService } from '../config/Config.service.js'

describe(SourceLocationDecorator.name, () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [GitStorageService, ConfigService, SourceLocationDecorator]
    }).compile()
  })

  it('decorates', async () => {
    const inputSystem = new System('test')
    inputSystem.addMicroService('service1')
    inputSystem.addMicroService('service2')

    const testStorageStatus: StorageStatus[] = [
      {
        name: 'service1',
        location: '/source/service1',
        lastModified: new Date()
      }
    ]
    const gitStorage = app.get<GitStorageService>(GitStorageService)
    gitStorage.getStorageStatus = async () => testStorageStatus

    const decorator = app.get<SourceLocationDecorator>(SourceLocationDecorator)
    const system = await decorator.transform(inputSystem)

    expect(system.findMicroService('service1').getPayload().sourceLocation).toBe('/source/service1')
    expect(system.findMicroService('service2').getPayload().sourceLocation).toBe('')
  })
})
