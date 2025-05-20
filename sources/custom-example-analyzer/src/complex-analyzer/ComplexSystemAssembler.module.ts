import { Module } from '@nestjs/common'

import {
  ConfigModule,
  GitModule,
  KubernetesModule,
  RabbitMqModule,
  SpringBootModule,
  JavaModule,
  PostProcessorsModule,
  SystemAssembler,
  SystemAssemblerController
} from 'tadis-analyzer'

import { ComplexSystemAssembler } from './ComplexSystemAssembler.service.js'

const customCollectorProvider = {
  provide: SystemAssembler,
  useClass: ComplexSystemAssembler
}

@Module({
  imports: [
    ConfigModule,
    PostProcessorsModule,
    JavaModule,
    SpringBootModule,
    RabbitMqModule,
    KubernetesModule,
    GitModule
  ],
  controllers: [SystemAssemblerController],
  providers: [customCollectorProvider],
  exports: []
})
export class ComplexSystemAssemblerModule {}
