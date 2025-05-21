import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import {
  findFiles,
  getServiceNameFromPath,
  isNoSourceOfThisProject
} from '../../../utils/files/analysis.js'

import { ConfigService } from '../../../config/Config.service.js'
import { System, AsyncEventFlow } from '../../../model/ms.js'
import { Metadata } from '../../../model/core.js'

const fileEndingToAnalyze = '.java'
const fileNameToAnalyzeMustInclude = 'send'
const pathToAnalyzeMustNotInclude = 'migration'

type ScanResult = {
  file: string
  serviceName: string
  exchangeName: string
}

@Injectable()
export class OutgoingExchangesFromSourceCreator {
  private readonly logger = new Logger(OutgoingExchangesFromSourceCreator.name)

  constructor(private readonly config: ConfigService) {}

  public async transform(system: System): Promise<System> {
    const scanResults = await this.scanPathForExchangesInSendConfigurations(
      this.config.getSourceFolder()
    )
    for (const scanResult of scanResults) {
      const metadata: Metadata = {
        transformer: OutgoingExchangesFromSourceCreator.name,
        context: 'service ' + scanResult.serviceName
      }

      const sourceService = system.addMicroService(
        scanResult.serviceName,
        undefined,
        metadata
      )
      const targetExchange = system.addMessageExchange(
        scanResult.exchangeName,
        undefined,
        metadata
      )

      const eventFlow = new AsyncEventFlow(
        sourceService,
        targetExchange,
        undefined,
        metadata
      )
      system.edges.push(eventFlow)

      this.logger.log(
        `added async event flow: ${sourceService.getPayload().name} -> ${
          targetExchange.getPayload().name
        }`
      )
    }
    return system
  }

  private async scanPathForExchangesInSendConfigurations(
    path: string
  ): Promise<ScanResult[]> {
    this.logger.log('scanning for exchange in ' + path)
    const filesToAnalyze = await findFiles(
      path,
      [fileEndingToAnalyze],
      undefined
    )
    this.logger.log(
      'found ' +
        filesToAnalyze.length +
        ' files which end with ' +
        fileEndingToAnalyze
    )

    const sendConfigurations: ScanResult[] = []
    filesToAnalyze
      .filter(
        (file) => isNoSourceOfThisProject(file) && isSendConfiguration(file)
      )
      .forEach((file) => {
        const exchangeNames = parseExchangeVariables(file)
        exchangeNames.forEach((exchangeName) => {
          const serviceName = getServiceNameFromPath(path, file)
          sendConfigurations.push({ file, serviceName, exchangeName })
        })
      })

    this.logger.log(
      'found ' + sendConfigurations.length + ' send configuration'
    )
    return sendConfigurations
  }
}

function isSendConfiguration(file) {
  return (
    getFileNameWithoutPath(file)
      .toLowerCase()
      .includes(fileNameToAnalyzeMustInclude) &&
    !file.toLowerCase().includes(pathToAnalyzeMustNotInclude) &&
    isNotPartOfTestInSourceProject(file)
  )
}

function isNotPartOfTestInSourceProject(file) {
  // TODO: make this configurable
  return !file.toLowerCase().includes('test') || process.env.NODE_ENV === 'test'
}

function parseExchangeVariables(file: string): string[] {
  const exchangeNames: string[] = []

  const pattern = /exchange[\w]*[\s]*=\s*"(\w+)"/gi
  const fileContent = fs.readFileSync(file, 'utf8')
  let matches = pattern.exec(fileContent)
  while (matches != null) {
    exchangeNames.push(matches[1])
    matches = pattern.exec(fileContent)
  }

  return exchangeNames
}

function getFileNameWithoutPath(fileLocation) {
  const lastSlashIndex = fileLocation.lastIndexOf('/')
  return fileLocation.slice(lastSlashIndex + 1)
}
