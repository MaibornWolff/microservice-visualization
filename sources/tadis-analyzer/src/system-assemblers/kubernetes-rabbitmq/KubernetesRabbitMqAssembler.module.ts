import { Module } from '@nestjs/common'

import { ConfigModule, ConfigService } from '../../config/Config.module.js'
import { KubernetesModule } from '../../system-element-extractors/kubernetes/Kubernetes.module.js'
import { RabbitMqModule } from '../../system-element-extractors/rabbitmq/RabbitMq.module.js'
import { SystemAssemblerController } from '../controllers/SystemAssembler.controller.js'
import { KubernetesRabbitMqAssembler } from './KubernetesRabbitMqAssembler.service.js'
import { GitModule } from '../../git/Git.module.js'
import { SystemAssembler } from '../controllers/SystemAssembler.service.js'
import { SpringBootModule } from '../../system-element-extractors/spring-boot/SpringBoot.module.js'
import { PostProcessorsModule } from '../../post-processors/PostProcessors.module.js'

@Module({
  imports: [
    ConfigModule,
    GitModule,
    KubernetesModule,
    RabbitMqModule,
    SpringBootModule,
    PostProcessorsModule
  ],
  controllers: [SystemAssemblerController],
  providers: [
    KubernetesRabbitMqAssembler,
    {
      provide: SystemAssembler,
      useClass: KubernetesRabbitMqAssembler
    },
    ConfigService
  ],
  exports: [KubernetesRabbitMqAssembler, ConfigService]
})
class KubernetesRabbitMqAssemblerModule {}

export { KubernetesRabbitMqAssemblerModule, KubernetesRabbitMqAssembler }
