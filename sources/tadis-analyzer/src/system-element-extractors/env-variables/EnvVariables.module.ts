import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module.js'
import { ExchangesFromEnvPayloadCreator } from './ExchangesFromEnvPayloadCreator.js'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [ExchangesFromEnvPayloadCreator],
  exports: [ExchangesFromEnvPayloadCreator]
})
class EnvVariablesModule {}

export { EnvVariablesModule, ExchangesFromEnvPayloadCreator }
