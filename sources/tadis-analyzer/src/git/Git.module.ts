import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module.js'
import { GitStorageController } from './GitStorage.controller.js'
import { GitStorageService } from './GitStorage.service.js'
import { SourceLocationDecorator } from './SourceLocationDecorator.js'

@Module({
  imports: [ConfigModule],
  controllers: [GitStorageController],
  providers: [GitStorageService, SourceLocationDecorator],
  exports: [GitStorageService, SourceLocationDecorator]
})
class GitModule {}

export { GitModule, GitStorageService, SourceLocationDecorator }
