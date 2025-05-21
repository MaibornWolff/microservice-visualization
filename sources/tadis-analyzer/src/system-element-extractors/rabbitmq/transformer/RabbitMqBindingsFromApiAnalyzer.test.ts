import { Test, TestingModule } from '@nestjs/testing'
import { describe, it, beforeAll, expect } from 'vitest'

import { ConfigService } from '../../../config/Config.service.js'

import { System, MessageQueue } from '../../../model/ms.js'
import { RabbitMqBindingsFromApiAnalyzer } from './RabbitMqBindingsFromApiAnalyzer.js'
import { RabbitMqManagementApiService } from '../api/api.service.js'

import testQueues from './testdata/api/queues.json' with { type: "json" }
import testBindings from './testdata/api/bindings.json' with { type: "json" }
import { verifyEachContentHasTransformer } from '../../../test/verifiers.js'
import { HttpModule } from '@nestjs/axios'

describe(RabbitMqBindingsFromApiAnalyzer.name, () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [],
      imports: [HttpModule],
      providers: [
        ConfigService,
        RabbitMqBindingsFromApiAnalyzer,
        RabbitMqManagementApiService
      ]
    }).compile()
  })

  it('creates message exchanges and flows for each queue binding to an existing microservice', async () => {
    const apiService = app.get<RabbitMqManagementApiService>(
      RabbitMqManagementApiService
    )
    apiService.getQueues = async () => testQueues
    apiService.getBindings = async () => testBindings

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const inputSystem = new System('test')
    inputSystem.addMicroService('receiver-service', {}, {context: "test", transformer: RabbitMqBindingsFromApiAnalyzer.name})

    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem).to.not.be.null

    expect(outputSystem.getMicroServices()).to.have.lengthOf(1)
    expect(outputSystem.getMessageExchanges()).to.have.lengthOf(2)

    expect(outputSystem.getMicroServices()[0].getName()).to.deep.equal(
      'receiver-service'
    )
    expect(outputSystem.getMessageExchanges()[0].getName()).to.deep.equal(
      'source-exchange-1'
    )
    expect(outputSystem.getMessageExchanges()[1].getName()).to.deep.equal(
      'source-exchange-2'
    )

    expect(outputSystem.getAsyncEventFlows()).to.have.lengthOf(2)

    expect(outputSystem.getAsyncEventFlows()[0].source.id).to.deep.equal(
      outputSystem.getMessageExchanges()[0].id
    )
    expect(outputSystem.getAsyncEventFlows()[0].target.id).to.deep.equal(
      outputSystem.getMicroServices()[0].id
    )

    expect(outputSystem.getAsyncEventFlows()[1].source.id).to.deep.equal(
      outputSystem.getMessageExchanges()[1].id
    )
    expect(outputSystem.getAsyncEventFlows()[1].target.id).to.deep.equal(
      outputSystem.getMicroServices()[0].id
    )

    verifyEachContentHasTransformer(
      outputSystem,
      RabbitMqBindingsFromApiAnalyzer.name
    )
  })

  it('does not create a microservice from a queue pattern when the microservice does not exist in the input system', async () => {
    const apiService = app.get<RabbitMqManagementApiService>(
      RabbitMqManagementApiService
    )
    apiService.getQueues = async () => testQueues
    apiService.getBindings = async () => testBindings

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const inputSystem = new System('test')
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem.getMicroServices()).to.have.lengthOf(0)
    expect(outputSystem.getMessageExchanges()).to.have.lengthOf(2)

    const queueNode = outputSystem.nodes.find(
      (node) => node.content.type === MessageQueue.name
    )
    expect(queueNode).to.not.be.undefined
    expect(queueNode.getName()).to.deep.equal(
      'receiver-service.routingKey.publish.update'
    )

    expect(outputSystem.getAsyncEventFlows()[0].source.id).to.deep.equal(
      outputSystem.getMessageExchanges()[0].id
    )
    expect(outputSystem.getAsyncEventFlows()[0].target.id).to.deep.equal(queueNode.id)

    verifyEachContentHasTransformer(
      outputSystem,
      RabbitMqBindingsFromApiAnalyzer.name
    )
  })

  it('creates queues for queues which do not match the name pattern', async () => {
    const apiService = app.get<RabbitMqManagementApiService>(
      RabbitMqManagementApiService
    )
    apiService.getQueues = async () => [
      {
        name: 'no-service-prefix'
      }
    ]
    apiService.getBindings = async () => [
      {
        source: 'source-exchange-1',
        vhost: '/',
        destination: 'no-service-prefix',
        destination_type: 'queue'
      }
    ]

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const inputSystem = new System('test')
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem.getMicroServices()).to.have.lengthOf(0)
    expect(outputSystem.getMessageExchanges()).to.have.lengthOf(1)

    const queueNode = outputSystem.nodes.find(
      (node) => node.content.type === MessageQueue.name
    )
    expect(queueNode).to.not.be.undefined
    expect(queueNode.getName()).to.deep.equal('no-service-prefix')

    verifyEachContentHasTransformer(
      outputSystem,
      RabbitMqBindingsFromApiAnalyzer.name
    )
  })

  it('does not create empty exchanges when there are only empty source properties in bindings', async () => {
    const apiService = app.get<RabbitMqManagementApiService>(
      RabbitMqManagementApiService
    )
    apiService.getQueues = async () => testQueues
    apiService.getBindings = async () => [
      {
        source: '',
        vhost: '/',
        destination: testQueues[0].name,
        destination_type: 'queue',
        routing_key: testQueues[0].name,
        arguments: {},
        properties_key: testQueues[0].name
      }
    ]

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const outputSystem = await addExchangesFormSourceStep.transform(
      new System('test')
    )

    expect(outputSystem).to.not.be.null

    expect(outputSystem.nodes).to.have.lengthOf(0)
    expect(outputSystem.edges).to.have.lengthOf(0)
  })
})
