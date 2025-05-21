import { Module } from '@nestjs/common'

import { ConfigService } from './Config.service.js'

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConfigService
  ],
  exports: [
    ConfigService
  ]
})
class ConfigModule { }

export { ConfigModule, ConfigService }
