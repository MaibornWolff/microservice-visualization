import { describe, it, expect } from 'vitest';
import { Node } from './model.js';
import { SecondLevelEdgesRemover } from './SecondLevelEdgesRemover.js';

describe('SecondLevelEdgesRemover', () => {
  it('second level edges are removed', () => {
    const inputGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        {
          id: 'top1',
          nodes: [
            { id: 'a' }
          ]
        },
        {
          id: 'top2',
          nodes: [
            { id: 'b' },
            { id: 'c' }
          ],
          edges: [
            { sourceId: 'b', targetId: 'c' }
          ]
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    const expectedGraph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        {
          id: 'top1',
          nodes: [
            { id: 'a' }
          ]
        },
        {
          id: 'top2',
          nodes: [
            { id: 'b' },
            { id: 'c' }
          ]
        }
      ],
      edges: [
        { sourceId: 'a', targetId: 'b' }
      ]
    })

    const edgesRemover = new SecondLevelEdgesRemover()
    const resultGraph = edgesRemover.transformer(inputGraph)

    expect(resultGraph).toEqual(expectedGraph)
  })
})
