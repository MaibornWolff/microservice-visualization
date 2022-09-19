import { describe, test } from 'mocha'
import { expect } from 'chai'
import { Node } from '~/domain/model'
import { GraphService } from '~/domain/service'
import { NodeFocusser } from '~/domain/NodeFocusser'

describe('NodeFocusser', function() {

  test('node is focused to neighbours', () => {
    const inputGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ],
          properties: {
            bProp: 'b-prop-value'
          }
        },
        { id: 'e' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' },
        { sourceId: 'a', targetId: 'e' }
      ]
    })

    const expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ],
          properties: {
            bProp: 'b-prop-value'
          }
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    const nodeFocusser = new NodeFocusser(new GraphService(inputGraph))
    const resultGraph = nodeFocusser.focusNodeById('b')

    expect(resultGraph).to.eql(expectedGraph)
  })

  test('node is focused to neighbours and their neighbours, i.e. 2nd level neighbours', () => {
    const inputGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
        { id: 'd' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' },
        { sourceId: 'b', targetId: 'c' },
        { sourceId: 'c', targetId: 'd' }
      ]
    })

    const expectedGraphFocusedToA: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' },
        { sourceId: 'b', targetId: 'c' }
      ]
    })

    const nodeFocusser = new NodeFocusser(new GraphService(inputGraph))
    const resultGraph = nodeFocusser.focusNodeById('a', 2)

    expect(resultGraph).to.eql(expectedGraphFocusedToA)
  })

  test('when a node with no edges is focused then outside nodes with edges to inside nodes are added', () => {
    const graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ]
        },
        { id: 'e' }
      ],
      edges: [
        { sourceId: 'a', targetId: 'c' },
        { sourceId: 'a', targetId: 'e' }
      ]
    })

    const nodeFocusser = new NodeFocusser(new GraphService(graph))

    const expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' },
            { id: 'd' }
          ],
          edges: [
            { sourceId: 'c', targetId: 'd' }
          ]
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'c' }
      ]
    })

    expect(nodeFocusser.focusNodeById('b')).to.eql(expectedGraph)
  })

})
