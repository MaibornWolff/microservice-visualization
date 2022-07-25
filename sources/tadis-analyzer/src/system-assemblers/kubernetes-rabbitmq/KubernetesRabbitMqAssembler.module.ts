import { Module } from '@nestjs/common'

import { ConfigModule, ConfigService } from '../../config/Config.module'
import { KubernetesModule } from '../../system-element-extractors/kubernetes/Kubernetes.module'
import { RabbitMqModule } from '../../system-element-extractors/rabbitmq/RabbitMq.module'
import { SystemAssemblerController } from '../controllers/SystemAssembler.controller'
import { KubernetesRabbitMqAssembler } from './KubernetesRabbitMqAssembler.service'
import { GitModule } from '../../git/Git.module'
import { SystemAssembler } from '../controllers/SystemAssembler.service'
import { SpringBootModule } from '../../system-element-extractors/spring-boot/SpringBoot.module'
import { PostProcessorsModule } from '../../post-processors/PostProcessors.module'

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
