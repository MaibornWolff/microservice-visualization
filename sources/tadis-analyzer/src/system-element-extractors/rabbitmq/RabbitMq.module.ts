import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { RabbitMqManagementApiService } from './api/api.service'
import { ConfigModule } from '../../config/Config.module'
import { RabbitMqBindingsFromApiAnalyzer } from './transformer/RabbitMqBindingsFromApiAnalyzer'
import { OutgoingExchangesFromSourceCreator } from './transformer/OutgoingExchangesFromSourceCreator'

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [],
  providers: [
    RabbitMqManagementApiService,
    RabbitMqBindingsFromApiAnalyzer,
    OutgoingExchangesFromSourceCreator
  ],
  exports: [
    RabbitMqManagementApiService,
    RabbitMqBindingsFromApiAnalyzer,
    OutgoingExchangesFromSourceCreator
  ]
})
class RabbitMqModule {}

export {
  RabbitMqModule,
  RabbitMqManagementApiService,
  RabbitMqBindingsFromApiAnalyzer,
  OutgoingExchangesFromSourceCreator
}
