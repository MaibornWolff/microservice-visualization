import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { describe, it, beforeAll, beforeEach, expect } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'

import { ConfigService } from '../../config/Config.service.js'

import { System, AsyncEventFlow } from '../../model/ms.js'
import { verifyEachContentHasTransformer } from '../../test/verifiers.js'
import {
  JavaAnnotationAnalyzer,
  ElementMapping
} from './JavaAnnotationAnalyzer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe(JavaAnnotationAnalyzer.name, () => {
  let app: TestingModule

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [ConfigService, JavaAnnotationAnalyzer]
    }).compile()

    const config = app.get<ConfigService>(ConfigService)
    config.getSourceFolder = () => __dirname + '/testdata/source-folder'
  })

  const elementMappings: ElementMapping[] = [
    {
      elementToDeriveNodeFrom: 'sendToExchange',
      nodeTypeToCreate: 'MessageExchange',
      nodeTypeDirection: 'target',
      edgeType: 'AsyncEventFlow'
    },
    {
      elementToDeriveNodeFrom: 'receiveFromExchange',
      nodeTypeToCreate: 'MessageExchange',
      nodeTypeDirection: 'source',
      edgeType: 'AsyncEventFlow'
    }
  ]

  it('creates an async info flow for multiple annotations in the same file', async () => {
    const inputSystem = new System('test')
    inputSystem.addMicroService('service1', {}, {context: "test", transformer: JavaAnnotationAnalyzer.name})

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(
      inputSystem,
      'EventProcessor',
      elementMappings
    )

    expect(outputSystem.findMicroService('service1')).to.not.be.undefined
    expect(outputSystem.findMessageExchange('target-exchange-X')).to.not.be.undefined
    expect(outputSystem.findMessageExchange('target-exchange-Y')).to.not.be.undefined

    expect(
      outputSystem.edges.find(
        (edge) =>
          edge.source.getName() === 'service1' &&
          edge.target.getName() === 'target-exchange-X' &&
          edge.content.type === AsyncEventFlow.name
      )
    ).to.not.be.undefined

    expect(
      outputSystem.edges.find(
        (edge) =>
          edge.source.getName() === 'service1' &&
          edge.target.getName() === 'target-exchange-Y'
      )
    ).to.not.be.undefined

    verifyEachContentHasTransformer(outputSystem, JavaAnnotationAnalyzer.name)
  })

  it('re-uses exchanges when they already exist', async () => {
    const inputSystem = new System('test')
    inputSystem.addMicroService('service1', {}, {context: "test", transformer: JavaAnnotationAnalyzer.name})
    inputSystem.addMessageExchange('source-exchange-X')

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(
      inputSystem,
      'EventProcessor',
      elementMappings
    )

    expect(outputSystem.findMicroService('service1')).to.not.be.undefined
    expect(
      outputSystem.nodes.filter(
        (node) => node.getName() === 'source-exchange-X'
      )
    ).to.have.lengthOf(1)

    verifyEachContentHasTransformer(outputSystem, JavaAnnotationAnalyzer.name)
  })

  it('ignores source of services which are not part of the input system', async () => {
    const inputSystem = new System('test')

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(
      inputSystem,
      'EventProcessor',
      elementMappings
    )

    expect(outputSystem.findMicroService('service1')).to.be.undefined
    expect(outputSystem.findMessageExchange('target-exchange')).to.be.undefined
  })

  it('can create nodes from multiple elements in the same annotation', async () => {
    const inputSystem = new System('test')
    inputSystem.addMicroService('service1', {}, {context: "test", transformer: JavaAnnotationAnalyzer.name})

    const transformer = app.get<JavaAnnotationAnalyzer>(JavaAnnotationAnalyzer)
    const outputSystem = await transformer.transform(
      inputSystem,
      'EventProcessor',
      elementMappings
    )

    expect(outputSystem.findMicroService('service1')).to.not.be.undefined
    expect(outputSystem.findMessageExchange('source-exchange-X')).to.not.be.undefined
    expect(outputSystem.findMessageExchange('target-exchange-X')).to.not.be.undefined

    expect(
      outputSystem.edges.find(
        (edge) =>
          edge.source.getName() === 'service1' &&
          edge.target.getName() === 'target-exchange-X'
      )
    ).to.not.be.undefined

    expect(
      outputSystem.edges.find(
        (edge) =>
          edge.source.getName() === 'source-exchange-X' &&
          edge.target.getName() === 'service1'
      )
    ).to.not.be.undefined

    verifyEachContentHasTransformer(outputSystem, JavaAnnotationAnalyzer.name)
  })
})
