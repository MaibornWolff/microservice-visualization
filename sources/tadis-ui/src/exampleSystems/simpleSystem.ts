import { INode } from '../domain/model.js'

export const system: INode = {
  id: 'simple',
  name: 'simple',
  type: 'System',
  nodes: [
    {
      id: 'source1',
      name: 'source1',
      type: 'MicroService',
      properties: {
        shared: true,
        sourceLocation: '/sources/source1',
        metadata: {
          transformer: 'MicroservicesFromKubernetesCreator',
          context: 'pod source1-d6f8d5g6kl',
          info: 'hello'
        }
      }
    },
    {
      id: 'source2',
      name: 'source2',
      type: 'MicroService',
      properties: {
        sourceLocation: ''
      }
    },
    { id: 'sink1', name: 'sink1', type: 'MicroService' },
    {
      id: 'sink2',
      name: 'sink2',
      type: 'MicroService',
      properties: {
        metadata: {
          transformerName: 'ManualElementsProducer'
        }
      }
    },
    {
      id: 'subsystem1',
      name: 'subsystem1',
      type: 'System',
      nodes: [
        {
          id: 'a',
          name: 'a',
          type: 'MessageQueue'
        },
        { id: 'c', name: 'c', type: 'MicroService' }
      ],
      edges: [
        {
          sourceId: 'c',
          targetId: 'a',
          type: 'AsyncInfoFlow'
        }
      ]
    },
    {
      id: 'b',
      name: 'b',
      type: 'MicroService',
      properties: {
        reduced: true
      }
    },
    { id: 'd', name: 'd', type: 'MessageExchange' }
  ],
  edges: [
    {
      sourceId: 'source1',
      targetId: 'c',
      type: 'AsyncInfoFlow',
      properties: {
        metadata: {
          transformer: 'OutgoingExchangesFromSourceCreator; JavaAnnotationAnalyzer; X',
          context: 'service source1; some very long context information is given here; X'
        }
      }
    },
    {
      sourceId: 'c',
      targetId: 'd',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'source2',
      targetId: 'c',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'source2',
      targetId: 'd',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'd',
      targetId: 'b',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'a',
      targetId: 'sink1',
      type: 'AsyncInfoFlow'
    },
    {
      sourceId: 'b',
      targetId: 'sink1',
      type: 'SyncInfoFlow',
      properties: {
        definedEndpoints: [
          {
            path: '/path/to/x'
          }
        ]
      }
    },
    {
      sourceId: 'b',
      targetId: 'sink2',
      type: 'AsyncInfoFlow',
      properties: {
        metadata: {
          transformerName: 'ManualElementsProducer'
        }
      }
    }
  ]
}
