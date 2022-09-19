import { describe, test } from 'mocha'
import { expect } from 'chai'
import { Node } from '../../src/domain/model'
import { GraphService } from '../../src/domain/service'

describe('graph service functions', function() {

  test('find nodes by id', () => {
    const graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' }
          ]
        }
      ]
    })
    const graphService = new GraphService(graph)

    expect(graphService.findNode('a').id).to.eql('a')
    expect(graphService.findNode('c').id).to.eql('c')
  })

  test('reduce node to certain nodes', () => {
    const node: Node = Node.ofRawNode({
      id: 'a',
      nodes: [
        { id: 'b' },
        {
          id: 'c',
          nodes: [
            { id: 'd' },
            { id: 'e' }
          ],
          edges: [
            { sourceId: 'd', targetId: 'e' }
          ]
        }
      ],
      edges: [
        { sourceId: 'b', targetId: 'c' },
        { sourceId: 'b', targetId: 'd' }
      ]
    })
    const graphService = new GraphService(node)

    expect(graphService.reduceNodesRecursive(node, ['b', 'c']))
      .to.eql(Node.ofRawNode({
        id: 'a',
        nodes: [
          { id: 'b' },
          { id: 'c' }
        ],
        edges: [
          { sourceId: 'b', targetId: 'c' }
        ]
      }))

    expect(graphService.reduceNodesRecursive(node, ['d', 'e']))
      .to.eql(Node.ofRawNode({
        id: 'a',
        nodes: [
          {
            id: 'c',
            nodes: [
              { id: 'd' },
              { id: 'e' }
            ],
            edges: [
              { sourceId: 'd', targetId: 'e' }
            ]
          }
        ]
      }))
  })

})
