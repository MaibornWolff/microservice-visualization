import { Get, Controller, Param, Query } from '@nestjs/common'
import { GitStorageService } from './GitStorage.service.js'
import { StorageStatus } from './GitStorage.js'

@Controller()
export class GitStorageController {
  constructor(private readonly gitStorage: GitStorageService) {}

  /**
   * @deprecated use GET on /git
   */
  @Get('source/status')
  async getStorageStatusDeprecated(): Promise<StorageStatus[]> {
    return this.getStorageStatus()
  }

  /**
   * @deprecated use GET on /git/import/:repositoryName
   */
  @Get('source/store/repository/:repositoryName')
  async importRepositoryAsyncDeprecated(
    @Param('repositoryName') repositoryName: string,
    @Query('sync') sync: string
  ): Promise<string> {
    return this.importRepositoryAsync(repositoryName, sync)
  }

  // parallel request to the same endpoint will be handled one after the other, i.e. sequentially.
  // in contrast, requests to different endpoints are handled in parallel.

  @Get('git')
  async getStorageStatus(): Promise<StorageStatus[]> {
    return this.gitStorage.getStorageStatus()
  }

  @Get('git/import/:repositoryName')
  async importRepositoryAsync(
    @Param('repositoryName') repositoryName: string,
    @Query('sync') sync: string
  ): Promise<string> {
    if (sync !== undefined) {
      return this.storeRepositorySync(repositoryName)
    }

    // tslint:disable-next-line: no-floating-promises
    this.gitStorage.storeRepository(repositoryName)
    return 'started storing in background ...'
  }

  private async storeRepositorySync(repositoryName: string): Promise<string> {
    const localPath = await this.gitStorage.storeRepository(repositoryName)
    if (!localPath) {
      return 'storing failed!'
    }

    return 'stored to local path ' + localPath
  }
}
