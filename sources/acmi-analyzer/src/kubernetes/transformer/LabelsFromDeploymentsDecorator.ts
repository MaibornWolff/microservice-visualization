import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { ConfigService } from '../../config/config.service'
import { System, MicroService } from '../../model/ms'
import { KubernetesApiService } from '../api/api.service'

@Injectable()
export class LabelsFromDeploymentsDecorator {
  private readonly logger = new Logger(LabelsFromDeploymentsDecorator.name)

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
      if (_.has(deployment, 'metadata.labels')) {
        const associatedMicroService = this.findAssociatedMicroService(system, deployment)
        if (associatedMicroService) {
          associatedMicroService.getPayload().labels = deployment.metadata.labels
          this.logger.log('added labels for service ' + associatedMicroService)
        }
      }
    }
  }

  private findAssociatedMicroService(system: System, deployment: any): MicroService | undefined {
    for (const service of system.getMicroServices()) {
      const serviceName = service.getPayload().name
      if (_.has(deployment, 'metadata.name')
        && deployment.metadata.name.startsWith(serviceName)) {
        return service
      }
    }
    return undefined
  }
}
