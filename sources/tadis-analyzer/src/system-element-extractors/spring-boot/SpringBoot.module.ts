import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module.js'
import { FeignClientAnnotationAnalyzer } from './FeignClientAnnotationAnalyzer.js'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [FeignClientAnnotationAnalyzer],
  exports: [FeignClientAnnotationAnalyzer]
})
class SpringBootModule {}

export { SpringBootModule, FeignClientAnnotationAnalyzer }
