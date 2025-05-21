import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module.js'
import { StaticNodeFilter } from './StaticNodeFilter.js'
import { SubSystemFromPayloadTransformer } from './SubSystemFromPayloadTransformer.js'
import { MicroserviceWithOutgoingExchangeMerger } from './MicroserviceWithOutgoingExchangeMerger.js'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    StaticNodeFilter,
    SubSystemFromPayloadTransformer,
    MicroserviceWithOutgoingExchangeMerger
  ],
  exports: [
    StaticNodeFilter,
    SubSystemFromPayloadTransformer,
    MicroserviceWithOutgoingExchangeMerger
  ]
})
class PostProcessorsModule {}

export {
  PostProcessorsModule,
  StaticNodeFilter,
  SubSystemFromPayloadTransformer,
  MicroserviceWithOutgoingExchangeMerger
}
