import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { System, SyncDataFlow } from '../../model/ms'
import { SystemAssemblerController } from './SystemAssembler.controller'
import { SystemAssembler } from './SystemAssembler.service'
import { SystemAssemblerModule } from './SystemAssembler.module'

describe(SystemAssemblerController.name, () => {
  let app: INestApplication

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [SystemAssemblerModule]
    }).compile()
    app = testingModule.createNestApplication()
    await app.init()
  })

  it('collects the system and provides it with the transport model', async () => {
    const system = new System('test')
    const serviceA = system.addMicroService('A')
    const serviceB = system.addMicroService('B')
    system.edges.push(new SyncDataFlow(serviceA, serviceB))

    const orchestrator = app.get<SystemAssembler>(SystemAssembler)
    jest.spyOn(orchestrator, 'getSystem').mockImplementation(async () => system)

    return request(app.getHttpServer())
      .get('/system')
      .expect(200)
      .then((response) => {
        const result = JSON.parse(response.text)

        expect(result.nodes).toHaveLength(2)

        expect(result.edges[0].sourceId).toBeDefined()
        expect(result.edges[0].source).toBeUndefined()
        expect(result.edges[0].targetId).toBeDefined()
        expect(result.edges[0].target).toBeUndefined()
      })
  })

  it('collects the system and adapts it a v1 model', async () => {
    const system = new System('test')
    const orchestrator = app.get<SystemAssembler>(SystemAssembler)
    jest.spyOn(orchestrator, 'getSystem').mockImplementation(async () => system)

    return request(app.getHttpServer())
      .get('/system?version=1')
      .expect(200)
      .then((response) => {
        const result = JSON.parse(response.text)
        expect(result.name).toEqual('test')
        expect(result.type).toEqual('System')
      })
  })
})
