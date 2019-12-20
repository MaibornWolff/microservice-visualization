import { Module } from '@nestjs/common'
import { ConfigModule } from 'tadis-analyzer'

import { CustomCollectorModule } from './CustomCollector.module'

@Module({
  imports: [
    ConfigModule,
    CustomCollectorModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
