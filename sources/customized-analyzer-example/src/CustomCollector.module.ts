import { Module } from '@nestjs/common'

import {
  ConfigModule, SourceCodeAnalysisModule,
  DefaultCollectorService, MsaModule, JavaModule, CollectorController
} from 'tadis-analyzer'

import { CustomCollectorService } from './CustomCollector.service'

const customCollectorProvider = {
  provide: DefaultCollectorService,
  useClass: CustomCollectorService
}

@Module({
  imports: [
    ConfigModule,
    SourceCodeAnalysisModule,
    JavaModule,
    MsaModule
  ],
  controllers: [
    CollectorController
  ],
  providers: [
    customCollectorProvider
  ],
  exports: [
  ]
})
export class CustomCollectorModule { }
