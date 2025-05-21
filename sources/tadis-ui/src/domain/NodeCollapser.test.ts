import { describe, it, expect } from 'vitest';
import { Node } from './model.js';
import { NodeCollapser } from './NodeCollapser.js';

describe('node collapser', () => {
  it('top level parent node of a graph is found', () => {
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

    expect(nodeCollapser.getTopLevelParentOfNodeInGraph('c', graph).id).toBe('b')
    expect(nodeCollapser.getTopLevelParentOfNodeInGraph('d', graph).id).toBe('b')
  })

  it('edges to inside nodes of all contained nodes are moved to edges to the contained nodes themselves', () => {
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

    expect(collapsedGraph).toEqual(expectedGraph)
  })

})
