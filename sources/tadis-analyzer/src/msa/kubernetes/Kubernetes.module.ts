import { Module } from '@nestjs/common'

import { KubernetesApiService } from './api/api.service'
import { ConfigModule } from '../../config/Config.module'
import { EnvDefinitionFromPodDecorator } from './transformer/EnvDefinitionFromPodDecorator'
import { LabelsFromDeploymentDecorator } from './transformer/LabelsFromDeploymentDecorator'
import { MicroservicesFromKubernetesCreator } from './transformer/MicroservicesFromKubernetesCreator'

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
