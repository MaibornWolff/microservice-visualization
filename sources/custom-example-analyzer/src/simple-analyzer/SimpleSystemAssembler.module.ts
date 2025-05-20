import { Module } from '@nestjs/common'

import {
  ConfigModule,
  GitModule,
  JavaModule,
  PostProcessorsModule,
  SystemAssembler,
  SpringBootModule,
  SystemAssemblerController
} from 'tadis-analyzer'

import { SimpleSystemAssembler } from './SimpleSystemAssembler.service.js'

@Module({
  imports: [
    ConfigModule,
    GitModule,
    JavaModule,
    SpringBootModule,
    PostProcessorsModule
  ],
  controllers: [SystemAssemblerController],
  providers: [
    {
      provide: SystemAssembler,
      useClass: SimpleSystemAssembler
    }
  ],
  exports: []
})
export class SimpleSystemAssemblerModule {}
