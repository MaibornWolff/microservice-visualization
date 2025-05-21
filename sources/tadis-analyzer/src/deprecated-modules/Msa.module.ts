import { Module } from '@nestjs/common'

import { ConfigModule } from '../config/Config.module.js'
import { CommonTransformersModule } from './CommonTransformers.module.js'
import { KubernetesModule } from '../system-element-extractors/kubernetes/Kubernetes.module.js'
import { RabbitMqModule } from '../system-element-extractors/rabbitmq/RabbitMq.module.js'
import { SystemAssemblerController } from '../system-assemblers/controllers/SystemAssembler.controller.js'
import { KubernetesRabbitMqAssembler } from '../system-assemblers/kubernetes-rabbitmq/KubernetesRabbitMqAssembler.service.js'
import { FeignClientAnnotationAnalyzer } from '../system-element-extractors/spring-boot/FeignClientAnnotationAnalyzer.js'
import { SourceCodeAnalysisModule } from './SourceCodeAnalysis.module.js'
import { SystemAssembler } from '../system-assemblers/controllers/SystemAssembler.service.js'
import { ISystemAssembler } from '../system-assemblers/controllers/ISystemAssembler.js'

type CollectorController = SystemAssemblerController
type Collector = ISystemAssembler
type DefaultCollectorService = SystemAssembler

@Module({
  imports: [
    ConfigModule,
    CommonTransformersModule,
    SourceCodeAnalysisModule,
    KubernetesModule,
    RabbitMqModule
  ],
  controllers: [SystemAssemblerController],
  providers: [
    FeignClientAnnotationAnalyzer,
    KubernetesRabbitMqAssembler,
    {
      provide: SystemAssembler,
      useClass: KubernetesRabbitMqAssembler
    }
  ],
  exports: [
    KubernetesModule,
    RabbitMqModule,
    FeignClientAnnotationAnalyzer,
    SystemAssembler,
    KubernetesRabbitMqAssembler
  ]
})
/**
 * @deprecated use KubernetesModule, RabbitMqModule, SpringBootModule
 */
class MsaModule {}

export {
  MsaModule,
  KubernetesModule,
  RabbitMqModule,
  FeignClientAnnotationAnalyzer,
  SystemAssembler,
  KubernetesRabbitMqAssembler,
  SystemAssemblerController,
  ISystemAssembler,
  CollectorController,
  Collector,
  DefaultCollectorService
}
