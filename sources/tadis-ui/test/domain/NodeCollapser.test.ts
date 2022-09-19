import { describe, test } from 'mocha'
import { expect } from 'chai'
import { Node } from '~/domain/model'
import { NodeCollapser } from '~/domain/NodeCollapser'

describe('node collapser', function() {

  test('top level parent node of a graph is found', () => {
    const graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        {
          id: 'a'
        },
        {
          id: 'b',
          nodes: [
            {
              id: 'c',
              nodes: [
                {
                  id: 'd'
                }
              ]
            }
          ]
        }
      ]
    })

    const nodeCollapser = new NodeCollapser()

    expect(nodeCollapser.getTopLevelParentOfNodeInGraph('c', graph).id).to.eql('b')
    expect(nodeCollapser.getTopLevelParentOfNodeInGraph('d', graph).id).to.eql('b')
  })

  test('edges to inside nodes of all contained nodes are moved to edges to the contained nodes themselfes', () => {
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
      ],
      edges: [
        { sourceId: 'a', targetId: 'c' }
      ]
    })

    const nodeCollapser = new NodeCollapser()
    const collapsedGraph = nodeCollapser.collapseContainedNodes(graph)

    const expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        { id: 'b' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    expect(collapsedGraph).to.eql(expectedGraph)
  })

})
