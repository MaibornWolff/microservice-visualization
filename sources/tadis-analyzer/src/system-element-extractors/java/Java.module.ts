import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module.js'
import {
  JavaAnnotationAnalyzer,
  ElementMapping
} from './JavaAnnotationAnalyzer.js'
import { GitModule } from '../../git/Git.module.js'

@Module({
  imports: [ConfigModule, GitModule],
  controllers: [],
  providers: [JavaAnnotationAnalyzer],
  exports: [JavaAnnotationAnalyzer]
})
class JavaModule {}

export { JavaModule, JavaAnnotationAnalyzer, ElementMapping }
