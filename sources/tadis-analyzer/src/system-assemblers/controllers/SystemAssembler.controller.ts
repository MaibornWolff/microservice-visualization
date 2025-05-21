import { Get, Controller, Logger, Query } from '@nestjs/common'

import { GitStorageService } from '../../git/GitStorage.service.js'

import { adaptToV1 } from '../../model/v1-legacy/v1-adapter.js'
import { convertCoreToTransportNode } from '../../model/transport.js'
import { SystemAssembler } from './SystemAssembler.service.js'

@Controller()
export class SystemAssemblerController {
  private readonly logger = new Logger(SystemAssemblerController.name)

  constructor(
    private readonly assembler: SystemAssembler,
    private readonly gitStorage: GitStorageService
  ) {}

  /**
   * @deprecated use GET /system
   */
  @Get('collect/system')
  async getSystemDeprecated(@Query('version') version: string): Promise<any> {
    return this.getSystem(version)
  }

  /**
   * @deprecated use GET /system/import_source
   */
  @Get('collect/source')
  async importSourceDeprecated(): Promise<string> {
    return this.importSource()
  }

  @Get('system')
  async getSystem(@Query('version') version: string): Promise<any> {
    const system = await this.assembler.getSystem()

    if (version === '1') {
      return adaptToV1(system)
    }

    return convertCoreToTransportNode(system)
  }

  @Get('system/import_source')
  async importSource(): Promise<string> {
    // tslint:disable-next-line: no-floating-promises
    this.importSourceInBackground()
    return 'started storing in background ...'
  }

  async importSourceInBackground() {
    const microservices = await this.assembler.getAllMicroservices()
    for (const microservice of microservices) {
      // TODO: this could be faster when we let store be executed in parallel until a certain limit is reached.
      // see https://stackoverflow.com/questions/53144401/limit-the-number-of-concurrent-child-processes-spawned-in-a-loop-in-node-js
      await this.gitStorage.storeRepository(microservice.getName(),
        microservice.getPayload().labels?.repositoryName)
    }
    this.logger.log('finished storing system source')
  }
}
