import { Module } from '@nestjs/common'

import { RabbitMqManagementApiService } from './api/api.service'
import { ConfigModule } from '../../config/Config.module'
import { RabbitMqBindingsFromApiAnalyzer } from './transformer/RabbitMqBindingsFromApiAnalyzer'
import { ExchangesFromEnvPayloadCreator } from './transformer/ExchangesFromEnvPayloadCreator'
import { OutgoingExchangesFromSourceCreator } from './transformer/OutgoingExchangesFromSourceCreator'
import { MicroserviceWithOutgoingExchangeMerger } from './transformer/MicroserviceWithOutgoingExchangeMerger'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [
  ],
  providers: [
    RabbitMqManagementApiService,
    RabbitMqBindingsFromApiAnalyzer,
    ExchangesFromEnvPayloadCreator,
    OutgoingExchangesFromSourceCreator,
    MicroserviceWithOutgoingExchangeMerger
  ],
  exports: [
    RabbitMqManagementApiService,
    RabbitMqBindingsFromApiAnalyzer,
    ExchangesFromEnvPayloadCreator,
    OutgoingExchangesFromSourceCreator,
    MicroserviceWithOutgoingExchangeMerger
  ]
})
class RabbitMqModule { }

export {
  RabbitMqModule,
  RabbitMqManagementApiService,
  RabbitMqBindingsFromApiAnalyzer,
  ExchangesFromEnvPayloadCreator,
  OutgoingExchangesFromSourceCreator,
  MicroserviceWithOutgoingExchangeMerger
}
