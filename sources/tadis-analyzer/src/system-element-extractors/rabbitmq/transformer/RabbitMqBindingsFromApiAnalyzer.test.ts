import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../../../config/Config.service'

import { System, MessageQueue } from '../../../model/ms'
import { RabbitMqBindingsFromApiAnalyzer } from './RabbitMqBindingsFromApiAnalyzer'
import { RabbitMqManagementApiService } from '../api/api.service'

import testQueues from './testdata/api/queues.json'
import testBindings from './testdata/api/bindings.json'
import { verifyEachContentHasTransformer } from '../../../test/verifiers'
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
    jest
      .spyOn(apiService, 'getQueues')
      .mockImplementation(async () => testQueues)
    jest
      .spyOn(apiService, 'getBindings')
      .mockImplementation(async () => testBindings)

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const inputSystem = new System('test')
    inputSystem.addMicroService('receiver-service')

    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.getMicroServices()).toHaveLength(1)
    expect(outputSystem.getMessageExchanges()).toHaveLength(2)

    expect(outputSystem.getMicroServices()[0].getName()).toEqual(
      'receiver-service'
    )
    expect(outputSystem.getMessageExchanges()[0].getName()).toEqual(
      'source-exchange-1'
    )
    expect(outputSystem.getMessageExchanges()[1].getName()).toEqual(
      'source-exchange-2'
    )

    expect(outputSystem.getAsyncEventFlows()).toHaveLength(2)

    expect(outputSystem.getAsyncEventFlows()[0].source.id).toEqual(
      outputSystem.getMessageExchanges()[0].id
    )
    expect(outputSystem.getAsyncEventFlows()[0].target.id).toEqual(
      outputSystem.getMicroServices()[0].id
    )

    expect(outputSystem.getAsyncEventFlows()[1].source.id).toEqual(
      outputSystem.getMessageExchanges()[1].id
    )
    expect(outputSystem.getAsyncEventFlows()[1].target.id).toEqual(
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
    jest
      .spyOn(apiService, 'getQueues')
      .mockImplementation(async () => testQueues)
    jest
      .spyOn(apiService, 'getBindings')
      .mockImplementation(async () => testBindings)

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const inputSystem = new System('test')
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem.getMicroServices()).toHaveLength(0)
    expect(outputSystem.getMessageExchanges()).toHaveLength(2)

    const queueNode = outputSystem.nodes.find(
      (node) => node.content.type === MessageQueue.name
    )
    expect(queueNode).toBeDefined()
    expect(queueNode.getName()).toEqual(
      'receiver-service.routingKey.publish.update'
    )

    expect(outputSystem.getAsyncEventFlows()[0].source.id).toEqual(
      outputSystem.getMessageExchanges()[0].id
    )
    expect(outputSystem.getAsyncEventFlows()[0].target.id).toEqual(queueNode.id)

    verifyEachContentHasTransformer(
      outputSystem,
      RabbitMqBindingsFromApiAnalyzer.name
    )
  })

  it('creates queues for queues which do not match the name pattern', async () => {
    const apiService = app.get<RabbitMqManagementApiService>(
      RabbitMqManagementApiService
    )
    jest.spyOn(apiService, 'getQueues').mockImplementation(async () => [
      {
        name: 'no-service-prefix'
      }
    ])
    jest.spyOn(apiService, 'getBindings').mockImplementation(async () => [
      {
        source: 'source-exchange-1',
        vhost: '/',
        destination: 'no-service-prefix',
        destination_type: 'queue'
      }
    ])

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const inputSystem = new System('test')
    const outputSystem = await addExchangesFormSourceStep.transform(inputSystem)

    expect(outputSystem.getMicroServices()).toHaveLength(0)
    expect(outputSystem.getMessageExchanges()).toHaveLength(1)

    const queueNode = outputSystem.nodes.find(
      (node) => node.content.type === MessageQueue.name
    )
    expect(queueNode).toBeDefined()
    expect(queueNode.getName()).toEqual('no-service-prefix')

    verifyEachContentHasTransformer(
      outputSystem,
      RabbitMqBindingsFromApiAnalyzer.name
    )
  })

  it('does not create empty exchanges when there are only empty source properties in bindings', async () => {
    const apiService = app.get<RabbitMqManagementApiService>(
      RabbitMqManagementApiService
    )
    jest
      .spyOn(apiService, 'getQueues')
      .mockImplementation(async () => testQueues)
    jest.spyOn(apiService, 'getBindings').mockImplementation(async () => [
      {
        source: '',
        vhost: '/',
        destination: testQueues[0].name,
        destination_type: 'queue',
        routing_key: testQueues[0].name,
        arguments: {},
        properties_key: testQueues[0].name
      }
    ])

    const addExchangesFormSourceStep = app.get<RabbitMqBindingsFromApiAnalyzer>(
      RabbitMqBindingsFromApiAnalyzer
    )

    const outputSystem = await addExchangesFormSourceStep.transform(
      new System('test')
    )

    expect(outputSystem).not.toBeNull()

    expect(outputSystem.nodes).toHaveLength(0)
    expect(outputSystem.edges).toHaveLength(0)
  })
})
