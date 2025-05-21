import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import {
  findFiles,
  getServiceNameFromPath,
  isNoSourceOfThisProject
} from '../../utils/files/analysis.js'

import { ConfigService } from '../../config/Config.service.js'
import { System, MicroService } from '../../model/ms.js'

// tslint:disable-next-line
import * as ms from '../../model/ms.js'
import { Metadata } from 'src/model/core.js'

const logger = new Logger('AnnotationAnalyzer')

@Injectable()
export class JavaAnnotationAnalyzer {
  private readonly logger = new Logger(JavaAnnotationAnalyzer.name)

  constructor(private readonly config: ConfigService) {}

  public async transform(
    system: System,
    annotation: string,
    elementMappings: ElementMapping[]
  ): Promise<System> {
    await this.transformSourcesInPath(
      system,
      this.config.getSourceFolder(),
      annotation,
      elementMappings
    )
    return system
  }

  private async transformSourcesInPath(
    system: System,
    path: string,
    annotation: string,
    elementMappings: ElementMapping[]
  ) {
    this.logger.log('scanning java files in ' + path)
    const javaFiles = await findFiles(path, ['.java'], undefined)
    this.logger.log('found ' + javaFiles.length + ' java files')

    javaFiles
      .filter((file) => isNoSourceOfThisProject(file))
      .forEach((file) => {
        // TODO: make this async
        const serviceName = getServiceNameFromPath(path, file)
        const service = system.findMicroService(serviceName)
        if (!service) {
          this.logger.log(
            'skipping source of microservice ' +
              serviceName +
              ' because it is not part of the input system.'
          )
        } else {
          const fileContent = fs.readFileSync(file, 'utf8')

          transformEachAnnotation(
            system,
            service,
            annotation,
            fileContent,
            elementMappings
          )
        }
      })
  }
}

/**
 * Specifies a mapping of an annotation element to nodes and edges.
 */
export type ElementMapping = {
  /**
   * name of the annotation element from which a node is derived.
   * the value of the annotation element defines the name of the node.
   * the node will be created if it does not already exist or else an existing node will be re-used.
   */
  elementToDeriveNodeFrom: string

  /**
   * class name of the node to create for the element
   */
  nodeTypeToCreate: string

  /**
   * specifies if the node will be the source or the target of the microservice
   * that contains the annotation in its source code.
   * values: only source or target
   */
  nodeTypeDirection: string

  /**
   * specifies the class name of the edge that will be created between the
   * current microservice and the node
   */
  edgeType: string
}

function transformEachAnnotation(
  system: System,
  service: MicroService,
  annotationName: string,
  fileContent: string,
  elementMappings: ElementMapping[]
) {
  const annotationPattern = '@' + annotationName + '\\s*\\(([^\\)]+)\\)'
  const annotationRegExp = new RegExp(annotationPattern, 'g')
  const annotationBodies = getAllPatternMatches<string>(
    annotationRegExp,
    fileContent,
    (matchArray: RegExpExecArray) => matchArray[1]
  )

  annotationBodies.forEach((body) =>
    transformEachElement(system, service, fileContent, body, elementMappings)
  )
}

function transformEachElement(
  system: System,
  service: MicroService,
  fileContent: string,
  annotationBody: string,
  elementMappings: ElementMapping[]
) {
  logger.log(
    'analyzing annotation body in service ' +
      service.getName() +
      ':\n' +
      annotationBody
  )

  for (const elementMapping of elementMappings) {
    const elementPattern =
      elementMapping.elementToDeriveNodeFrom + '\\s*=\\s*([^\\),]+)'
    const elementRegExp = new RegExp(elementPattern, 'g')
    const matchingElementValues = getAllPatternMatches<string>(
      elementRegExp,
      annotationBody,
      (matchArray: RegExpExecArray) => matchArray[1]
    )

    matchingElementValues.forEach((value) =>
      transformElementValueExpression(
        system,
        service,
        fileContent,
        elementMapping,
        value
      )
    )
  }
}

function transformElementValueExpression(
  system: System,
  service: MicroService,
  fileContent: string,
  elementMapping: ElementMapping,
  valueExpression: string
) {
  const nodeName = getActualValue(valueExpression, fileContent)
  if (!nodeName) return

  executeMappingForNode(system, service, elementMapping, nodeName)
}

function getActualValue(valueExpression: string, fileContent: string): string {
  if (valueExpression.startsWith('"')) {
    return valueExpression.substr(1, valueExpression.length - 2)
  } else {
    // search variable assignment
    // TODO: skip if defined in comment
    const assignmentPattern = valueExpression + '\\s*=\\s*"([^"]*)"'
    const assignmentRegExp = new RegExp(assignmentPattern, 'g')
    const assignmentValues = getAllPatternMatches<string>(
      assignmentRegExp,
      fileContent,
      (matchArray: RegExpExecArray) => matchArray[1]
    )
    return assignmentValues.length > 0 ? assignmentValues[0] : undefined
  }
}

function executeMappingForNode(
  system: System,
  service: MicroService,
  elementMapping: ElementMapping,
  nodeName: string
) {
  const metadata: Metadata = {
    transformer: JavaAnnotationAnalyzer.name,
    context: 'service ' + service.id,
    info:
      'mapping of element ' +
      elementMapping.elementToDeriveNodeFrom +
      ' to target ' +
      nodeName
  }
  const node = system.addOrExtendTypedNode(
    elementMapping.nodeTypeToCreate,
    nodeName,
    undefined,
    metadata
  )

  logger.log(
    'ensured node of type ' +
      elementMapping.nodeTypeToCreate +
      ' and name ' +
      nodeName +
      ' exists.'
  )

  if (elementMapping.nodeTypeDirection === 'target') {
    const edge = new ms[elementMapping.edgeType](
      service,
      node,
      undefined,
      metadata
    )
    system.edges.push(edge)
    logger.log(
      'added ' + elementMapping.edgeType + ': ' + service.id + ' -> ' + node.id
    )
  } else if (elementMapping.nodeTypeDirection === 'source') {
    const edge = new ms[elementMapping.edgeType](
      node,
      service,
      undefined,
      metadata
    )
    logger.log(
      'added ' + elementMapping.edgeType + ': ' + node.id + ' -> ' + service.id
    )
    system.edges.push(edge)
  } else {
    // TODO: log error
  }
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
