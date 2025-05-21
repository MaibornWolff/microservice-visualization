import { TypedNode, TypedEdge } from './core-typed.js'
import { Node, Metadata } from './core.js'

/**
 * this model provides type-safe access to nodes in a microservice system.
 */

// TODO: move to msa/model/msa.ts
export class System extends TypedNode<NamePayload> {

  constructor(id: string, metadata?: Metadata) {
    super(id, { name: id }, metadata, System.name)
  }

  // TODO: these public methods could be generated from a model definition in the future

  public addMicroService(name: string, extraPayload: any = {}, metadata?: Metadata): MicroService {
    return this.addOrExtendNamedNode<MicroService>(MicroService, name, extraPayload, metadata)
  }

  public getMicroServices(): MicroService[] {
    return this.getNodes<MicroService>(MicroService)
  }

  public findMicroService(name: string): MicroService {
    return this.findTypedNodeWithName<MicroService>(MicroService, name)
  }

  public addMessageExchange(name: string, extraPayload: any = {}, metadata?: Metadata): MessageExchange {
    return this.addOrExtendNamedNode<MessageExchange>(MessageExchange, name, extraPayload, metadata)
  }

  public getMessageExchanges(): MessageExchange[] {
    return this.getNodes<MessageExchange>(MessageExchange)
  }

  public findMessageExchange(name: string): MessageExchange {
    return this.findTypedNodeWithName<MessageExchange>(MessageExchange, name)
  }

  public addMessageQueue(name: string, extraPayload: any = {}, metadata?: Metadata): MicroService {
    return this.addOrExtendNamedNode<MessageQueue>(MessageQueue, name, extraPayload, metadata)
  }

  public getSyncDataFlows(): SyncDataFlow[] {
    return this.getEdges<SyncDataFlow>(SyncDataFlow)
  }

  public getAsyncEventFlows(): AsyncEventFlow[] {
    return this.getEdges<AsyncEventFlow>(AsyncEventFlow)
  }
}

export class MicroService extends TypedNode<MicroServicePayload> {
  constructor(id: string, payload: MicroServicePayload, metadata?: Metadata) {
    super(id, payload, metadata, MicroService.name)
  }
}

export class MicroServicePayload {
  name: string
  env?: EnvEntry[]
  labels?: any
  sourceLocation?: string
}

type EnvEntry = {
  name: string,
  value: string
}

export class MessageExchangePayload {
  name: string
}

export class MessageExchange extends TypedNode<MessageExchangePayload> {
  constructor(id: string, payload: NamePayload, metadata?: Metadata) {
    super(id, payload, metadata, MessageExchange.name)
  }
}

export class MessageQueue extends TypedNode<NamePayload> {
  constructor(id: string, payload: NamePayload, metadata?: Metadata) {
    super(id, payload, metadata, MessageQueue.name)
  }
}

export class NamePayload {
  name: string
}

type AsyncEventFlowPayload = {
  routingKey: string
}

// TODO: can this be simplified? too much boilerplate code for constructor
export class AsyncEventFlow extends TypedEdge<AsyncEventFlowPayload> {
  constructor(source: Node, target: Node, payload?: AsyncEventFlowPayload, metadata?: Metadata) {
    super(source, target, payload, metadata, AsyncEventFlow.name)
  }
}

type SyncDataFlowPayload = {
  definedEndpoints: Endpoint[]
}

type Endpoint = {
  path: string
}

export class SyncDataFlow extends TypedEdge<SyncDataFlowPayload> {
  constructor(source: Node, target: Node, payload?: SyncDataFlowPayload, metadata?: Metadata) {
    super(source, target, payload, metadata, SyncDataFlow.name)
  }
}
