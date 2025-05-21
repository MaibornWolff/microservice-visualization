import { Module } from '@nestjs/common'

import { KubernetesApiService } from './api/api.service.js'
import { ConfigModule } from '../../config/Config.module.js'
import { EnvDefinitionFromPodDecorator } from './transformer/EnvDefinitionFromPodDecorator.js'
import { LabelsFromDeploymentDecorator } from './transformer/LabelsFromDeploymentDecorator.js'
import { MicroservicesFromKubernetesCreator } from './transformer/MicroservicesFromKubernetesCreator.js'

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [
  ],
  providers: [
    KubernetesApiService,
    EnvDefinitionFromPodDecorator,
    LabelsFromDeploymentDecorator,
    MicroservicesFromKubernetesCreator
  ],
  exports: [
    KubernetesApiService,
    EnvDefinitionFromPodDecorator,
    LabelsFromDeploymentDecorator,
    MicroservicesFromKubernetesCreator
  ]
})
class KubernetesModule { }

export {
  KubernetesModule,
  KubernetesApiService,
  EnvDefinitionFromPodDecorator,
  LabelsFromDeploymentDecorator,
  MicroservicesFromKubernetesCreator
}
