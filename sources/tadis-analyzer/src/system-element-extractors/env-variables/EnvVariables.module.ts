import { Module } from '@nestjs/common'

import { ConfigModule } from '../../config/Config.module'
import { ExchangesFromEnvPayloadCreator } from './ExchangesFromEnvPayloadCreator'

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [ExchangesFromEnvPayloadCreator],
  exports: [ExchangesFromEnvPayloadCreator]
})
class EnvVariablesModule {}

export { EnvVariablesModule, ExchangesFromEnvPayloadCreator }
