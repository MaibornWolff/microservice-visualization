import { Logger } from '@nestjs/common'

import * as cp from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import * as rimraf from 'rimraf'

export type StorageStatus = {
  name: string,
  location: string,
  lastModified: Date
}

export class GitStorage {
  private readonly logger = new Logger(GitStorage.name)

  private readonly childProcessOptions = {
    cwd: process.cwd(),
    env: process.env,
    stdio: [process.stdin, process.stdout, process.stderr],
    encoding: 'utf-8'
  }

  constructor(private sourceFolder: string, private gitBaseUrls: string[]) { }

  // TODO: improve error handling when ssh key is missing or not authorized
  async storeRepository(localRepositoryName: string, remoteRepositoryName: string): Promise<string | undefined> {
    for (const baseUrl of this.gitBaseUrls) {
      const url = baseUrl + '/' + remoteRepositoryName
      const localPath = await this.storeRepositoryFromUrl(localRepositoryName, url)
      if (localPath) {
        return localPath
      }
    }
    // TODO: maybe there is some way to check if a repository should be stored?
    this.logger.warn('could not store repository ' + localRepositoryName +
      (remoteRepositoryName !== localRepositoryName ? ' (remoteRepositoryName: ' + remoteRepositoryName + ') ' : '') +
      ' from any base URL!')
  }

  clearRepository(directoryName: string) {
    rimraf.sync(this.getLocalPath(directoryName))
  }

  async getStorageStatus(): Promise<StorageStatus[]> {
    const readdir = promisify(fs.readdir)
    const repositories = await readdir(this.sourceFolder)

    const repositoriesStatus = repositories.map(async repository => {
      const stat = promisify(fs.stat)
      const location = this.sourceFolder + '/' + repository
      const stats = await stat(location)
      return {
        name: repository,
        location,
        lastModified: stats.mtime
      }
    })

    return Promise.all(repositoriesStatus)
  }

  private async storeRepositoryFromUrl(repositoryName: string, repositoryUrl: string): Promise<string | undefined> {
    const valid = await this.isRepositoryValid(repositoryUrl)
    if (!valid) {
      this.logger.log('could not read repository ' + this.sanitizeUrlForLogging(repositoryUrl))
      return undefined
    }

    this.logger.log('storing repository ' + this.sanitizeUrlForLogging(repositoryUrl))
    if (this.isCloned(repositoryName)) {
      return this.updateRepository(repositoryName)
    } else {
      return this.cloneRepository(repositoryName, repositoryUrl)
    }
  }

  private async isRepositoryValid(repositoryUrl: string): Promise<boolean> {
    const child = cp.spawn('git', ['ls-remote', repositoryUrl], this.childProcessOptions)

    const exitCode = await this.getChildExitCode(child)
    return exitCode === 0
  }

  private isCloned(repositoryName: string): boolean {
    return fs.existsSync(this.getGitPath(repositoryName))
  }

  private getGitPath(repositoryName: string): string {
    return path.resolve(this.getLocalPath(repositoryName), '.git')
  }

  private getLocalPath(repositoryName: string): string {
    return path.resolve(this.sourceFolder, repositoryName)
  }

  private async updateRepository(repositoryName: string): Promise<string | undefined> {
    this.logger.log('pulling ' + repositoryName)

    const gitPath = this.getGitPath(repositoryName)
    const localPath = this.getLocalPath(repositoryName)

    const child = cp.spawn('git', [
      '--git-dir=' + gitPath,
      '--work-tree=' + localPath,
      'pull'
    ], this.childProcessOptions)

    const exitCode = await this.getChildExitCode(child)
    if (exitCode === 0) {
      return localPath
    } else {
      this.logger.error('failed to pull repository ', repositoryName)
      return undefined
    }
  }

  private async cloneRepository(repositoryName: string, repositoryUrl: string): Promise<string | undefined> {
    // INFO: using sync calls in an async call stack is an anti-pattern because it blocks the event processing loop.
    if (!fs.existsSync(this.sourceFolder)) {
      fs.mkdirSync(this.sourceFolder)
    }

    const localPath = this.getLocalPath(repositoryName)
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath)
    }

    this.logger.log('cloning repository ' + this.sanitizeUrlForLogging(repositoryUrl))

    const child = cp.spawn('git', [
      'clone',
      '--depth', '1', repositoryUrl, localPath
    ], this.childProcessOptions)

    const exitCode = await this.getChildExitCode(child)
    if (exitCode === 0) {
      return localPath
    } else {
      this.logger.error('failed to clone repository from url ' + this.sanitizeUrlForLogging(repositoryUrl))
      return undefined
    }
  }

  private async getChildExitCode(child: cp.ChildProcess): Promise<number | null> {
    return new Promise<number | null>(
      (resolve) => {
        child.on('exit', (code) => resolve(code))
      })
  }

  private sanitizeUrlForLogging(url: string): string {
    try {
      const urlObj = new URL(url)
      if (urlObj.username || urlObj.password) {
        urlObj.username = '***'
        urlObj.password = '***'
      }
      return urlObj.toString()
    } catch {
      // If URL parsing fails, return as-is (likely SSH format)
      return url
    }
  }
}
