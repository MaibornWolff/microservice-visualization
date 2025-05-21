import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module.js'
import { StaticNodeFilter } from '../post-processors/StaticNodeFilter.js'
import { SubSystemFromPayloadTransformer } from '../post-processors/SubSystemFromPayloadTransformer.js'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [StaticNodeFilter, SubSystemFromPayloadTransformer],
  exports: [StaticNodeFilter, SubSystemFromPayloadTransformer]
})
/**
 * @deprecated use PostProcessorsModule
 */
class CommonTransformersModule {}

export {
  CommonTransformersModule,
  StaticNodeFilter,
  SubSystemFromPayloadTransformer
}
