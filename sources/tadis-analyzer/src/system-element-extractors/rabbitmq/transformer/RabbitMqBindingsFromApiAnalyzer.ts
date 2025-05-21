import { Injectable, Logger } from '@nestjs/common'
import pkg from 'lodash';
const { flatMap } = pkg;


import { ConfigService } from '../../../config/Config.service.js'
import { System, AsyncEventFlow, MessageQueue } from '../../../model/ms.js'
import { RabbitMqManagementApiService } from '../api/api.service.js'
import { Metadata, Node } from '../../../model/core.js'

// this analyzer assumes that a queue starts with the name of the microservice
// which the queue belongs to. after the microservice name the delimiter below follows.
const microServiceNameDelimiter = '.'

type Binding = {
  exchange: string
  queue: string
}

@Injectable()
export class RabbitMqBindingsFromApiAnalyzer {
  private readonly logger = new Logger(RabbitMqBindingsFromApiAnalyzer.name)

  constructor(
    private readonly config: ConfigService,
    private readonly apiService: RabbitMqManagementApiService
  ) { }

  public async transform(system: System): Promise<System> {
    const queueNames = await this.getQueueNames()

    const bindingsPromises: Promise<Binding[]>[] = queueNames.map(queue => this.getBindings(queue))
    const bindings: Binding[][] = await Promise.all(bindingsPromises)
    const allBindings: Binding[] = flatMap(bindings)

    this.addEdgesFromBindings(system, allBindings)

    return system
  }

  private async getQueueNames() {
    const queues = await this.apiService.getQueues()
    if (!queues) return []

    return queues.map(queue => { return queue.name })
  }

  private addEdgesFromBindings(system: System, bindings: Binding[]) {
    bindings
      .filter(binding => binding.exchange !== '')
      .forEach(binding => {
        const metadata: Metadata = {
          transformer: RabbitMqBindingsFromApiAnalyzer.name,
          context: 'queue ' + binding.queue + ' bound to exchange ' + binding.exchange
        }
        const sourceExchangName = binding.exchange
        const sourceExchange = system.addMessageExchange(sourceExchangName, undefined, metadata)

        const targetNode = this.ensureTargetNodeExists(binding, system)

        system.edges.push(new AsyncEventFlow(sourceExchange, targetNode, undefined, metadata))

        this.logger.log('added async event flow: message exchange ' + sourceExchangName + ' -> microservice ' + targetNode.getName())
      })
    return system
  }

  private ensureTargetNodeExists(binding: Binding, system: System): Node {
    if (binding.queue.indexOf(microServiceNameDelimiter) >= 0) {
      const queuePrefix = binding.queue.substring(0, binding.queue.indexOf(microServiceNameDelimiter))
      const existingService = system.findMicroService(queuePrefix)
      if (existingService) {
        return existingService
      }
    }

    const metadata: Metadata = {
      transformer: RabbitMqBindingsFromApiAnalyzer.name,
      context: 'queue ' + binding.queue + ' bound to exchange ' + binding.exchange
    }
    const targetNodeName = binding.queue
    const queueNode = system.addOrExtendNamedNode<MessageQueue>(MessageQueue, targetNodeName, undefined, metadata)
    return queueNode
  }

  private async getBindings(queueName): Promise<Binding[]> {
    const bindingsData = await this.apiService.getBindings(queueName)

    const bindings: Binding[] = bindingsData.filter(element => element.source !== '')
      .map(element => {
        const binding = {
          'exchange': element.source,
          'queue': queueName
        }
        this.logger.log('found binding of queue ' + binding.queue + ' to exchange ' + binding.exchange)
        return binding
      })

    return bindings
  }

}
