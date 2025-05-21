import { Injectable, Logger } from '@nestjs/common'

import { ConfigService } from '../../config/Config.service.js'
import { System, AsyncEventFlow } from '../../model/ms.js'
import { Metadata } from '../../model/core.js'

const exchangeEnvNameMustInclude = 'EXCHANGE'
const outgoingEnvNameMustInclude = 'OUTGOING'
const incomingEnvNameMustInclude = 'INCOMING'

@Injectable()
export class ExchangesFromEnvPayloadCreator {
  private readonly logger = new Logger(ExchangesFromEnvPayloadCreator.name)

  constructor(private readonly config: ConfigService) {}

  /**
   * looks for env vars that configure an exchange and adds corresponding system nodes.
   *
   * @param system: requires nodes to have payloads of type NodePayload
   */
  public async transform(system: System): Promise<System> {
    system.getMicroServices().forEach((service) => {
      const env = service.getPayload().env
      if (env) {
        env
          .filter((envEntry) =>
            envEntry.name.includes(exchangeEnvNameMustInclude)
          )
          .forEach((envEntry) => {
            const metadata: Metadata = {
              transformer: ExchangesFromEnvPayloadCreator.name,
              context: 'env variable ' + envEntry.name
            }

            if (envEntry.name.includes(outgoingEnvNameMustInclude)) {
              const outgoingExchange = system.addMessageExchange(
                envEntry.value,
                undefined,
                metadata
              )
              const edge = new AsyncEventFlow(
                service,
                outgoingExchange,
                undefined,
                metadata
              )
              system.edges.push(edge)
              this.logger.log(
                `added outgoing exchange ${envEntry.value} for service ${
                  service.getPayload().name
                }`
              )
            }
            if (envEntry.name.includes(incomingEnvNameMustInclude)) {
              const incomingExchange = system.addMessageExchange(
                envEntry.value,
                undefined,
                metadata
              )
              const eventFlow = new AsyncEventFlow(
                incomingExchange,
                service,
                undefined,
                metadata
              )
              system.edges.push(eventFlow)
              this.logger.log(
                `added incoming exchange ${envEntry.value} for service ${
                  service.getPayload().name
                }`
              )
            }
          })
      }
    })
    return system
  }
}
