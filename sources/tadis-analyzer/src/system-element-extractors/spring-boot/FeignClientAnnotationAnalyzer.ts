import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import {
  findFiles,
  getServiceNameFromPath,
  isNoSourceOfThisProject
} from '../../utils/files/analysis.js'

import { ConfigService } from '../../config/Config.service.js'
import { System, SyncDataFlow } from '../../model/ms.js'
import { Metadata } from 'src/model/core.js'

/**
 * Searches for @FeignClient annotations in the source code of a microservice
 * and adds a SyncDataFlow between the microservice and the target service
 * which is referred to in the value element of the annotation.
 */
@Injectable()
export class FeignClientAnnotationAnalyzer {
  private readonly className = FeignClientAnnotationAnalyzer.name
  private readonly logger = new Logger(this.className)

  constructor(private readonly config: ConfigService) {}

  public async transform(system: System): Promise<System> {
    const scanResults = await this.scanPathForFeignClients(
      this.config.getSourceFolder()
    )
    for (const scanResult of scanResults) {
      const metadata: Metadata = {
        transformer: this.className,
        context: 'service ' + scanResult.serviceName
      }
      const sourceService = system.addMicroService(
        scanResult.serviceName,
        undefined,
        metadata
      )
      const targetService = system.addMicroService(
        scanResult.feignClient.targetServiceName,
        undefined,
        metadata
      )

      // adds links in reverse to visualize information flow, TODO: make this configurable
      const definedEndpoints = scanResult.feignClient.requestMappings.map(
        (mapping) => ({ path: mapping.value })
      )
      const dataFlow = new SyncDataFlow(
        targetService,
        sourceService,
        { definedEndpoints },
        metadata
      )
      system.edges.push(dataFlow)

      this.logger.log(
        `added sync data flow: ${targetService.getPayload().name} -> ${
          sourceService.getPayload().name
        }`
      )
    }
    return system
  }

  private async scanPathForFeignClients(path: string): Promise<ScanResult[]> {
    this.logger.log('scanning for feign clients in ' + path)
    const javaFiles = await findFiles(path, ['.java'], undefined)
    this.logger.log('found ' + javaFiles.length + ' java files')

    const scanResults: ScanResult[] = []
    javaFiles
      .filter((file) => isNoSourceOfThisProject(file))
      .forEach((file) => {
        const feignClient = getFeignClientInFile(file)
        if (feignClient) {
          const serviceName = getServiceNameFromPath(path, file)
          const scanResult: ScanResult = {
            file,
            serviceName,
            feignClient
          }
          scanResults.push(scanResult)
          this.logger.log(
            'found feign client annotation in service ' + scanResult.serviceName
          )
        }
      })

    return scanResults
  }
}

type ScanResult = {
  file: string
  serviceName: string
  feignClient: FeignClient
}

type FeignClient = {
  targetServiceName: string
  requestMappings: RequestMapping[]
}

function getFeignClientInFile(path): FeignClient | undefined {
  // TODO: make this async
  const fileContent = fs.readFileSync(path, 'utf8')

  const feignPattern = /@FeignClient\s*\(\s*(value\s*=)?\s*"([\w-]+)"/
  const feignMatch = fileContent.match(feignPattern)
  if (feignMatch) {
    return {
      targetServiceName: feignMatch[2],
      requestMappings: getRequestMappings(fileContent)
    }
  }

  return undefined
}

type RequestMapping = {
  value: string
}

function getRequestMappings(fileContent: string): RequestMapping[] {
  const requestBodyList = getAllPatternMatches(
    /@RequestMapping\s*\(([^\)]+)\)/gi,
    fileContent,
    (matchArray) => matchArray[1]
  )

  const mappings = []
  requestBodyList.forEach((requestBody) => {
    const valueElements = getAllPatternMatches(
      /value\s*=\s*"([^"]+)"/gi,
      requestBody,
      (matchArray) => matchArray[1]
    )

    if (valueElements.length > 0) {
      mappings.push({ value: valueElements[0] })
    }
  })

  return mappings
}

function getAllPatternMatches<MatchType>(
  pattern: RegExp,
  content: string,
  matchTransformer: (matchArray: RegExpExecArray) => MatchType
): MatchType[] {
  const allMatches: MatchType[] = []

  let matches = pattern.exec(content)
  while (matches != null) {
    allMatches.push(matchTransformer(matches))
    matches = pattern.exec(content)
  }

  return allMatches
}
