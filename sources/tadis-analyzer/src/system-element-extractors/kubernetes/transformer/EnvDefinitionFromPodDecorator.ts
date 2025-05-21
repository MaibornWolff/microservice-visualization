import { Injectable, Logger } from '@nestjs/common'
import pkg from 'lodash';
const { has } = pkg;


import { ConfigService } from '../../../config/Config.service.js'
import { System } from '../../../model/ms.js'
import { KubernetesApiService } from '../api/api.service.js'

const logger = new Logger('add-kubernetes-env-vars')

@Injectable()
export class EnvDefinitionFromPodDecorator {

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: KubernetesApiService
  ) { }

  public async transform(system: System): Promise<System> {
    await this.addEnvVars(system)
    return system
  }

  private async addEnvVars(system: System) {
    const namespace = this.config.getKubernetesNamespace()
    const pods = await this.apiService.getPods(namespace)

    for (const pod of pods.items) {
      for (const service of system.getMicroServices()) {
        const serviceName = service.getPayload().name
        if (has(pod, 'metadata.name')
          && pod.metadata.name.startsWith(serviceName + '-')
          && has(pod, 'spec.containers')) {

          logger.log('found pod for ' + pod.metadata.name + ' service ' + serviceName)
          // TODO: make this configurable or more flexible
          let mergedEnvs: any[] = []
          for (const container of pod.spec.containers) {
            if (container.env !== undefined) {
              logger.log('addind env vars from pod')
              mergedEnvs = [...mergedEnvs, ...container.env]
            }
          }
          service.getPayload().env = mergedEnvs
        }
      }
    }
  }
}
