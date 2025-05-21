import { Module } from '@nestjs/common'

import { ConfigModule } from '../../../config/Config.module.js'
import { PatternAnalyzerService } from './PatternAnalyzer.service.js'
import { PatternAnalyzerController } from './PatternAnalyzer.controller.js'

@Module({
  imports: [ConfigModule],
  controllers: [PatternAnalyzerController],
  providers: [PatternAnalyzerService],
  exports: [PatternAnalyzerService]
})
class CodePatternModule {}

export { CodePatternModule, PatternAnalyzerService }
