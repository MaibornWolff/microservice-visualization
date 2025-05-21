import { Injectable } from '@nestjs/common'

import { ConfigService } from '../config/Config.service.js'
import { GitStorage, StorageStatus } from './GitStorage.js'

@Injectable()
export class GitStorageService {
  private readonly gitStorage: GitStorage

  constructor(private config: ConfigService) {
    this.gitStorage = new GitStorage(
      config.getSourceFolder(),
      config.getGitBaseUrls()
    )
  }

  async storeRepository(repositoryName: string, remoteRepositoryName?: string): Promise<string | undefined> {
    return this.gitStorage.storeRepository(repositoryName, remoteRepositoryName ?? repositoryName)
  }

  async getStorageStatus(): Promise<StorageStatus[]> {
    return this.gitStorage.getStorageStatus()
  }

  clearRepository(directoryName: string) {
    this.gitStorage.clearRepository(directoryName)
  }
}
