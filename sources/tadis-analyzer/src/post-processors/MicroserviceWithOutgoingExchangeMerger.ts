import { Injectable, Logger } from '@nestjs/common'

import {
  System,
  AsyncEventFlow,
  MicroService,
  MessageExchange
} from '../model/ms.js'
import { Node, Edge, Metadata } from '../model/core.js'

@Injectable()
export class MicroserviceWithOutgoingExchangeMerger {
  private readonly logger = new Logger(
    MicroserviceWithOutgoingExchangeMerger.name
  )

  public async transform(system: System): Promise<System> {
    return this.merge(system)
  }

  private merge(system: System): System {
    const result = new System(system.id)
    result.content = system.content

    this.getNonMessageExchanges(system).forEach((node) => {
      result.nodes.push(node)
    })

    const mergedExchanges: Node[] = []
    system.nodes.forEach((node) => {
      if (node.content.type === MessageExchange.name) {
        const exchange = node as MessageExchange
        const exchangeName = exchange.getName()
        if (!exchangeName) return

        const edgeTargetingSameNameMicroService = this.findEdgeTargetingSameNameMicroService(
          exchange,
          system
        )
        if (edgeTargetingSameNameMicroService) {
          const service = system.findMicroService(exchangeName)
          if (service) {
            this.extendPayloadOfMicroService(service, exchange.content.payload)
            this.extendMetadataOfMicroService(
              service,
              exchange.content.metadata
            )
            this.extendMetadataOfMicroService(
              service,
              edgeTargetingSameNameMicroService.content?.metadata
            )

            this.getOtherExchangeEdgesRedirectedToService(
              system,
              exchange,
              service
            ).forEach((edge) => result.edges.push(edge))

            mergedExchanges.push(exchange)
            this.logger.log(
              `merged exchange ${exchange.id} with service ${service.id}`
            )
          }
        } else {
          result.nodes.push(exchange)
        }
      }
    })

    this.getEdgesNotConnectedToMergedExchanges(mergedExchanges, system).forEach(
      (edge) => {
        result.edges.push(edge)
      }
    )

    return result
  }

  private getEdgesNotConnectedToMergedExchanges(
    nodes: Node[],
    system: System
  ): Edge[] {
    return system.edges.filter(
      (edge) => !nodes.includes(edge.source) && !nodes.includes(edge.target)
    )
  }

  private getOtherExchangeEdgesRedirectedToService(
    system: System,
    exchange: MessageExchange,
    service: MicroService
  ): Edge[] {
    return system.edges
      .filter(
        (edge) =>
          (edge.source === exchange || edge.target === exchange) &&
          edge.source !== edge.target &&
          !(
            edge.source.content.type === MicroService.name &&
            edge.source.hasSameNameAs(exchange)
          ) &&
          !(
            edge.target.content.type === MicroService.name &&
            edge.target.hasSameNameAs(exchange)
          )
      )
      .map((exchangeEdge) => {
        const source =
          exchangeEdge.source === exchange ? service : exchangeEdge.source
        const target =
          exchangeEdge.target === exchange ? service : exchangeEdge.target
        const newEdge = new AsyncEventFlow(
          source,
          target,
          exchangeEdge.content?.payload,
          exchangeEdge.content?.metadata
        )

        this.logger.log(
          `redirected ${exchangeEdge.source.id} -> ${exchangeEdge.target.id}` +
            ` to ${newEdge.source.id} -> ${newEdge.target.id}`
        )

        return newEdge
      })
  }

  private getNonMessageExchanges(system: System): Node[] {
    return system.nodes.filter(
      (node) => node.content.type !== MessageExchange.name
    )
  }

  private extendPayloadOfMicroService(
    service: MicroService,
    extraPayload: any
  ) {
    service.content.payload.reduced = true
    Object.getOwnPropertyNames(extraPayload).forEach(
      (payloadPropertyName) =>
        (service.content.payload[payloadPropertyName] =
          extraPayload[payloadPropertyName])
    )
  }

  private extendMetadataOfMicroService(
    service: MicroService,
    metadata: Metadata | undefined
  ) {
    if (!metadata) return

    if (service.content.metadata) {
      service.content.metadata.transformer += '; ' + metadata.transformer
      service.content.metadata.context += '; ' + metadata.context
      service.content.metadata.info += '; ' + metadata.info
    } else {
      service.content.metadata = metadata
    }
  }

  private findEdgeTargetingSameNameMicroService(
    exchange: MessageExchange,
    system: System
  ): Edge | undefined {
    return system.edges.find(
      (edge) =>
        edge.target.id === exchange.id &&
        edge.source.hasSameNameAs(exchange) &&
        edge.source.content.type === MicroService.name
    )
  }
}
