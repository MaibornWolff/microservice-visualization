import { Test, TestingModule } from '@nestjs/testing'
import { GitStorageController } from './GitStorage.controller.js'
import { GitStorageService } from './GitStorage.service.js'
import { ConfigService } from '../config/Config.service.js'
import { describe, it, beforeAll, expect } from 'vitest'

describe('SourceStorageController', () => {
  let app: TestingModule

  beforeAll(async () => {
    const configService = new ConfigService()
    configService.getSourceFolder = () => process.cwd() + '/src/git/testdata/source-folder'

    app = await Test.createTestingModule({
      controllers: [GitStorageController],
      providers: [GitStorageService, ConfigService]
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile()
  })

  describe('getStorageStatus', () => {
    it('returns something', async () => {
      const controller = app.get<GitStorageController>(GitStorageController)
      const status = await controller.getStorageStatus()
      expect(status).not.toBeNull()
    })
  })
})
