import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module.js'
import { GitStorageController } from '../git/GitStorage.controller.js'
import { GitStorageService } from '../git/GitStorage.service.js'
import { SourceLocationDecorator } from '../git/SourceLocationDecorator.js'
import * as fileAnalysis from '../utils/files/analysis.js'

@Module({
  imports: [ConfigModule],
  controllers: [GitStorageController],
  providers: [GitStorageService, SourceLocationDecorator],
  exports: [GitStorageService, SourceLocationDecorator]
})
/**
 * @deprecated use GitModule and fileAnalysis
 */
class SourceCodeAnalysisModule {}

export {
  SourceCodeAnalysisModule,
  GitStorageService,
  SourceLocationDecorator,
  fileAnalysis
}
