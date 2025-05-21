import { Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../../config/Config.service.js'
import { System } from '../../../model/ms.js'
import { KubernetesApiService } from '../api/api.service.js'
import { Metadata } from 'src/model/core.js'

@Injectable()
export class MicroservicesFromKubernetesCreator {
  private readonly logger = new Logger(MicroservicesFromKubernetesCreator.name)

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: KubernetesApiService
  ) {}

  public async transform(system: System): Promise<System> {
    return this.getSystem()
  }

  private async getSystem(): Promise<System> {
    const namespace = this.config.getKubernetesNamespace()
    try {
      const services = await this.apiService.getServices(namespace)
      const pods = await this.apiService.getPods(namespace)

      const system = new System(namespace)
      services.items.forEach((item) => {
        const serviceName = item.metadata.name
        if (this.isPodExisting(pods, serviceName + '-')) {
          const metadata: Metadata = {
            transformer: MicroservicesFromKubernetesCreator.name,
            context: 'service ' + serviceName
          }

          system.addMicroService(serviceName, undefined, metadata)
          this.logger.log('added microservice ' + serviceName)
        } else {
          this.logger.log(
            'not adding microservice ' +
              serviceName +
              ' because no pods were found'
          )
        }
      })
      return system
    } catch (err) {
      this.logger.error('Failed to get services from Kubernetes API: ', err)
      return new System(namespace)
    }
  }

  private isPodExisting(pods: any, podNamePrefixToCheck: string): boolean {
    return (
      pods.items &&
      pods.items.find((item) =>
        item.metadata.name.startsWith(podNamePrefixToCheck)
      ) !== undefined
    )
  }
}
