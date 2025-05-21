import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { RabbitMqManagementApiService } from './api/api.service.js'
import { ConfigModule } from '../../config/Config.module.js'
import { RabbitMqBindingsFromApiAnalyzer } from './transformer/RabbitMqBindingsFromApiAnalyzer.js'
import { OutgoingExchangesFromSourceCreator } from './transformer/OutgoingExchangesFromSourceCreator.js'

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
