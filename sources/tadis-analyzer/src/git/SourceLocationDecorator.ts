import { Injectable } from '@nestjs/common'

import { GitStorageService } from './GitStorage.service.js'
import { System } from '../model/ms.js'

/**
 * Decorates each microservice of the system for which source code was stored.
 * Adds the local source location of the source code.
 */
@Injectable()
export class SourceLocationDecorator {
  constructor(private gitStorage: GitStorageService) {}

  public async transform(system: System): Promise<System> {
    const storageStatus = await this.gitStorage.getStorageStatus()
    storageStatus.forEach((status) => {
      const service = system.findMicroService(status.name)
      if (service) {
        service.getPayload().sourceLocation = status.location
      }
    })
    this.setLocationUnknownForServicesWithoutSource(system)
    return system
  }

  private setLocationUnknownForServicesWithoutSource(system: System) {
    system
      .getMicroServices()
      .filter((service) => service.getPayload().sourceLocation === undefined)
      .forEach((service) => (service.getPayload().sourceLocation = ''))
  }
}
