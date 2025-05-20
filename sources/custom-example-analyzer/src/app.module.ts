import { Module } from '@nestjs/common'
import { ConfigModule } from 'tadis-analyzer'
import { SimpleSystemAssemblerModule } from './simple-analyzer/SimpleSystemAssembler.module.js'

@Module({
  imports: [ConfigModule, SimpleSystemAssemblerModule],
  controllers: [],
  providers: []
})
export class AppModule {}
