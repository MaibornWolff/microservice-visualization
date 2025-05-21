import { Injectable, Logger } from '@nestjs/common'
import pkg from 'lodash';
const { has } = pkg;

import { ConfigService } from '../../../config/Config.service.js'
import { System, MicroService } from '../../../model/ms.js'
import { KubernetesApiService } from '../api/api.service.js'

@Injectable()
export class LabelsFromDeploymentDecorator {
  private readonly logger = new Logger(LabelsFromDeploymentDecorator.name)

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: KubernetesApiService
  ) { }

  public async transform(system: System): Promise<System> {
    await this.addLabels(system)
    return system
  }

  private async addLabels(system: System) {
    const namespace = this.config.getKubernetesNamespace()

    const deployments = await this.apiService.getDeployments(namespace)
    for (const deployment of deployments.items) {
      if (has(deployment, 'metadata.labels')) {
        const associatedMicroService = this.findAssociatedMicroService(system, deployment)
        if (associatedMicroService) {
          associatedMicroService.getPayload().labels = deployment.metadata.labels
          this.logger.log('added labels ' +
            JSON.stringify(associatedMicroService.getPayload().labels) +
            ' for service ' + associatedMicroService.getName())
        }
      }
    }
  }

  private findAssociatedMicroService(system: System, deployment: any): MicroService | undefined {
    for (const service of system.getMicroServices()) {
      const serviceName = service.getPayload().name
      if (has(deployment, 'metadata.name') && deployment.metadata.name === serviceName) {
        return service
      }
    }
    return undefined
  }
}
