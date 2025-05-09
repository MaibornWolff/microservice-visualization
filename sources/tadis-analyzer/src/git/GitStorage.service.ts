import { Injectable } from '@nestjs/common'

import { ConfigService } from '../config/Config.service'
import { GitStorage, StorageStatus } from './GitStorage'

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
