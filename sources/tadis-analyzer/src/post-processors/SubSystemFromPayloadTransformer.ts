import { Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'

import { System } from '../model/ms.js'
import { Node } from '../model/core.js'

type mapNodeToSubSystemNameFunction = (node: Node) => string

/**
 * Transforms a flat system to a system of sub-systems where each node
 * is moved to its sub-system.
 * The associated sub-system of a node is derived from its payload.
 */
@Injectable()
export class SubSystemFromPayloadTransformer {
  public static readonly getSubSystemNameFromCabinetLabel = (
    node: Node
  ): string => {
    if (node.content.payload.labels) {
      return node.content.payload.labels.cabinet
    }
    return undefined
  }

  // TODO: the transformer could be made more generic by transforming nodes of any kind instead of just systems
  public async transform(
    system: System,
    getSubSystemName: mapNodeToSubSystemNameFunction
  ): Promise<System> {
    const transformer = new SubSystemTransformer(getSubSystemName)
    return transformer.moveNodesToTheirSubSystems(system)
  }
}

class SubSystemTransformer {
  private readonly logger = new Logger(SubSystemTransformer.name)

  constructor(private getSubSystemName: mapNodeToSubSystemNameFunction) {}

  moveNodesToTheirSubSystems(system: System): System {
    const transformedSystem = new System(system.id)
    transformedSystem.content = system.content

    system.nodes.forEach((childNode) => {
      const subSystemName = this.computeSubSystemName(system, childNode)
      if (subSystemName) {
        const subSystem = this.getOrElseCreateSubSystem(
          transformedSystem,
          subSystemName
        )

        subSystem.nodes.push(childNode)
        this.logger.log(
          `added node ${childNode.id} to sub-system ${subSystemName}`
        )
      } else {
        transformedSystem.nodes.push(childNode)
        this.logger.log(`added node ${childNode.id} to root system`)
      }
    })

    system.edges.forEach((edge) => {
      const sourceSubSystem = this.computeSubSystemName(system, edge.source)
      const targetSubSystem = this.computeSubSystemName(system, edge.target)
      if (
        sourceSubSystem &&
        targetSubSystem &&
        sourceSubSystem === targetSubSystem
      ) {
        const subSystem = this.getOrElseCreateSubSystem(
          transformedSystem,
          sourceSubSystem
        )
        subSystem.edges.push(edge)
      } else {
        transformedSystem.edges.push(edge)
      }
    })

    return transformedSystem
  }

  private computeSubSystemName(system: System, node: Node): string {
    const subSystemName = this.getSubSystemName(node)
    if (subSystemName) {
      return subSystemName
    } else {
      return this.deriveSubSystemFromIncomingNode(system, node)
    }
  }

  private getOrElseCreateSubSystem(
    system: System,
    subSystemName: string
  ): System {
    const existingNode = system.findTypedNodeWithName<System>(
      System,
      subSystemName
    )
    if (existingNode) return existingNode

    const newNode = new System(subSystemName)
    system.nodes.push(newNode)
    this.logger.log(`added sub-system ${subSystemName}`)
    return newNode
  }

  /**
   * derives the sub-system of a node from its incoming node if there is just one
   * and if it defines a sub-system.
   *
   * @param system
   * @param node which is inspected for an incoming node
   */
  private deriveSubSystemFromIncomingNode(system: System, node: Node): string {
    const incomingEdges = system.edges.filter(
      (edge) => edge.target.id === node.id
    )
    if (incomingEdges.length === 1) {
      const singleIncomingNode = incomingEdges[0].source
      return this.getSubSystemName(singleIncomingNode)
    }
    return undefined
  }
}
